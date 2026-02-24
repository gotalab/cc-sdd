/**
 * Context Monitor Plugin for OpenCode
 *
 * Writes real-time token usage to `.opencode/context-status.json` so the
 * external `context-monitor` MCP server can read it without needing access
 * to OpenCode's internal API.
 *
 * Installation: this file is automatically placed in `.opencode/plugins/`
 * by `cc-sdd --agent opencode-agent`. OpenCode loads all `.ts` files in
 * that directory at startup.
 *
 * Usage:
 *   - The tool `write_context_status` is registered and can be called
 *     explicitly by the AI or the user at any time.
 *   - Add the following to your steering file to make it automatic:
 *       "Call write_context_status at the start of each response."
 */

import type { Plugin } from "@opencode-ai/plugin"
import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MessageInfo {
  id: string
  role: string
  modelID?: string
  providerID?: string
  tokens?: {
    input?: number
    output?: number
    reasoning?: number
    cache?: {
      read?: number
      write?: number
    }
  }
}

interface SessionMessage {
  info: MessageInfo
  parts: unknown[]
}

interface ContextStatus {
  session_id: string
  model: string | null
  total_tokens: number
  input_tokens: number
  output_tokens: number
  reasoning_tokens: number
  cache_read_tokens: number
  cache_write_tokens: number
  timestamp: string
}

// ---------------------------------------------------------------------------
// Token extraction — mirrors the technique from the analyzed plugin
// ---------------------------------------------------------------------------

/**
 * Find the most recent assistant message that has non-zero token telemetry,
 * then compute total context usage the same way the plugin does:
 *   total = input + cache.read + cache.write + output + reasoning
 */
function extractTokensFromMessages(messages: SessionMessage[]): {
  status: ContextStatus
  model: string | null
} | null {
  const assistants = [...messages]
    .filter((m) => m.info.role === "assistant" && m.info.tokens)
    .map((m) => ({ info: m.info, t: m.info.tokens! }))

  const pick = assistants
    .slice()
    .reverse()
    .find(
      ({ t }) =>
        (Number(t.input) || 0) +
          (Number(t.output) || 0) +
          (Number(t.reasoning) || 0) +
          (Number(t.cache?.read) || 0) +
          (Number(t.cache?.write) || 0) >
        0,
    ) ?? assistants[assistants.length - 1]

  if (!pick) return null

  const t = pick.t
  const inputTokens = Number(t.input) || 0
  const outputTokens = Number(t.output) || 0
  const reasoningTokens = Number(t.reasoning) || 0
  const cacheReadTokens = Number(t.cache?.read) || 0
  const cacheWriteTokens = Number(t.cache?.write) || 0
  const totalTokens = inputTokens + outputTokens + reasoningTokens + cacheReadTokens + cacheWriteTokens

  return {
    status: {
      session_id: "",
      model: pick.info.modelID ?? null,
      total_tokens: totalTokens,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      reasoning_tokens: reasoningTokens,
      cache_read_tokens: cacheReadTokens,
      cache_write_tokens: cacheWriteTokens,
      timestamp: new Date().toISOString(),
    },
    model: pick.info.modelID ?? null,
  }
}

// ---------------------------------------------------------------------------
// File writer
// ---------------------------------------------------------------------------

function writeContextStatus(status: ContextStatus): void {
  const outputDir = path.join(process.cwd(), ".opencode")
  const outputPath = path.join(outputDir, "context-status.json")
  try {
    fs.mkdirSync(outputDir, { recursive: true })
    fs.writeFileSync(outputPath, JSON.stringify(status, null, 2) + "\n", "utf-8")
  } catch (err) {
    // Non-fatal: the MCP server will simply not find the file
    console.error("[context-monitor] Failed to write context-status.json:", err)
  }
}

// ---------------------------------------------------------------------------
// Plugin export
// ---------------------------------------------------------------------------

export const ContextMonitorPlugin: Plugin = async ({ client }) => {
  return {
    tool: {
      write_context_status: tool({
        description:
          "Write current session token usage to .opencode/context-status.json for the context-monitor MCP server. " +
          "Call this at the beginning of each response so the external monitor stays up to date.",
        args: {
          sessionID: tool.schema.string().optional(),
        },
        async execute(args, context) {
          const sessionID = args.sessionID ?? context.sessionID
          if (!sessionID) {
            return "No session ID available — cannot write context status."
          }

          const response = await client.session.messages({ path: { id: sessionID } })
          const messages: SessionMessage[] = (
            ((response as { data?: unknown }).data ?? response) ?? []
          ) as SessionMessage[]

          if (!Array.isArray(messages) || messages.length === 0) {
            return `Session ${sessionID} has no messages yet.`
          }

          const result = extractTokensFromMessages(messages)
          if (!result) {
            return "No assistant messages with token data found yet."
          }

          result.status.session_id = sessionID
          writeContextStatus(result.status)

          const { total_tokens, input_tokens, output_tokens, reasoning_tokens } = result.status
          return (
            `Context status written to .opencode/context-status.json\n` +
            `Total: ${total_tokens.toLocaleString()} tokens ` +
            `(in: ${input_tokens.toLocaleString()}, out: ${output_tokens.toLocaleString()}` +
            (reasoning_tokens > 0 ? `, reasoning: ${reasoning_tokens.toLocaleString()}` : "") +
            `)`
          )
        },
      }),
    },
  }
}
