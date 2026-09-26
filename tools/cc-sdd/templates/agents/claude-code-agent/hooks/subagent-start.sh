#!/usr/bin/env bash
# cc-sdd SubagentStart hook — injects the agent's ID and a pre-resolved context
# check command into the subagent's prompt via additionalContext.
#
# The context check command has the exact file path already resolved so the agent
# can run it verbatim without any shell variable substitution or globbing.

INPUT=$(cat)
AGENT_ID=$(echo "$INPUT" | jq -r '.agent_id // empty' 2>/dev/null)
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty' 2>/dev/null)

if [ -z "$AGENT_ID" ]; then
  echo "[cc-sdd] ⚠️  SubagentStart hook: could not extract agent_id from payload" >&2
  exit 0
fi

if [ -z "$SESSION_ID" ]; then
  echo "[cc-sdd] ⚠️  SubagentStart hook: could not extract session_id from payload" >&2
  exit 0
fi

CONTEXT_FILE=".claude/context-sessions/${SESSION_ID}_${AGENT_ID}.json"
CTX_CMD="jq -r '.usage_percentage // \"n/a\"' ${CONTEXT_FILE} 2>/dev/null || echo \"[CTX: unavailable]\""

jq -n \
  --arg id "$AGENT_ID" \
  --arg ctx_file "$CONTEXT_FILE" \
  --arg ctx_cmd "$CTX_CMD" \
  '{
    hookSpecificOutput: {
      hookEventName: "SubagentStart",
      additionalContext: ("CLAUDE_AGENT_ID=" + $id + "\nContext file: " + $ctx_file + "\nContext check command: " + $ctx_cmd)
    }
  }'

exit 0
