/**
 * Context Monitor Plugin for OpenCode
 *
 * Writes real-time token usage to `.opencode/context-status.json` so the
 * external `context-monitor` MCP server can read it without needing access
 * to OpenCode's internal API.
 *
 * Installation: this file is automatically placed in `.opencode/plugin/`
 * by `cc-sdd --agent opencode-agent`. OpenCode loads all `.ts` files in
 * that directory at startup.
 *
 * Usage:
 *   - The tool `write_context_status` is called by agents at natural checkpoints
 *     during heavy work (after loading large context, between execution steps).
 *   - Each subagent calls it inline and reads `Usage: X%` from the return value
 *     to decide whether to continue, warn, or create a handoff document.
 *   - The file `.opencode/context-status.json` is also written for statusline display.
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
  context_window_size: number
  usage_percentage: number
  timestamp: string
}

// ---------------------------------------------------------------------------
// Context window size lookup
// ---------------------------------------------------------------------------

const MODEL_CONTEXT_WINDOWS: Record<string, number> = {
  "claude-opus-4": 200000,
  "claude-sonnet-4": 200000,
  "claude-haiku-4": 200000,
  "claude-3-5-sonnet": 200000,
  "claude-3-5-haiku": 200000,
  "claude-3-opus": 200000,
  "claude-3-sonnet": 200000,
  "claude-3-haiku": 200000,
}

function getContextWindowSize(modelID: string | null): number {
  if (!modelID) return 200000
  const lower = modelID.toLowerCase()
  for (const [key, size] of Object.entries(MODEL_CONTEXT_WINDOWS)) {
    if (lower.includes(key)) return size
  }
  return 200000
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

  const modelID = pick.info.modelID ?? null
  const contextWindowSize = getContextWindowSize(modelID)
  const usagePercentage = Math.min(100, Math.round((totalTokens / contextWindowSize) * 1000) / 10)

  return {
    status: {
      session_id: "",
      model: modelID,
      total_tokens: totalTokens,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      reasoning_tokens: reasoningTokens,
      cache_read_tokens: cacheReadTokens,
      cache_write_tokens: cacheWriteTokens,
      context_window_size: contextWindowSize,
      usage_percentage: usagePercentage,
      timestamp: new Date().toISOString(),
    },
    model: modelID,
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

          const { total_tokens, input_tokens, output_tokens, reasoning_tokens, usage_percentage, context_window_size } =
            result.status
          return (
            `Context status written to .opencode/context-status.json\n` +
            `Total: ${total_tokens.toLocaleString()} tokens ` +
            `(in: ${input_tokens.toLocaleString()}, out: ${output_tokens.toLocaleString()}` +
            (reasoning_tokens > 0 ? `, reasoning: ${reasoning_tokens.toLocaleString()}` : "") +
            `)\n` +
            `Usage: ${usage_percentage}% of ${context_window_size.toLocaleString()} token context window`
          )
        },
      }),
    },
  }
}
