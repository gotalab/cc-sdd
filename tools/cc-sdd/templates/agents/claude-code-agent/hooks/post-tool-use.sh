#!/usr/bin/env bash
# cc-sdd PostToolUse hook — parses the session transcript after every tool call
# and writes a context file at .claude/context-sessions/{id}.json so agents can
# check their own context usage mid-execution via a Bash call.
#
# Subagent detection: SubagentStart writes a per-agent relay file at
#   .claude/context-sessions/.relay/{session_id}/{agent_id}
# This hook iterates over all relay files for the session to update each active
# subagent's context file, supporting parallel subagent execution.
# When the Task tool completes (tool_name=Task, tool_response.agentId set),
# the corresponding relay file is removed.

INPUT=$(cat)
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty' 2>/dev/null)
TRANSCRIPT_PATH=$(echo "$INPUT" | jq -r '.transcript_path // empty' 2>/dev/null)
CWD=$(echo "$INPUT" | jq -r '.cwd // empty' 2>/dev/null)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty' 2>/dev/null)

if [ -z "$SESSION_ID" ]; then
  echo "[cc-sdd] ⚠️  PostToolUse hook: session_id missing from payload" >&2
  exit 0
fi

if [ -z "$TRANSCRIPT_PATH" ]; then
  echo "[cc-sdd] ⚠️  PostToolUse hook: transcript_path missing from payload" >&2
  exit 0
fi

if [ ! -f "$TRANSCRIPT_PATH" ]; then
  echo "[cc-sdd] ⚠️  PostToolUse hook: transcript file not found: $TRANSCRIPT_PATH" >&2
  exit 0
fi

if [ -z "$CWD" ]; then
  echo "[cc-sdd] ⚠️  PostToolUse hook: cwd missing from payload" >&2
  exit 0
fi

RELAY_DIR="$CWD/.claude/context-sessions/.relay/$SESSION_ID"

# If this is the Task tool completing, remove that agent's relay file and context file.
if [ "$TOOL_NAME" = "Task" ]; then
  COMPLETED_AGENT_ID=$(echo "$INPUT" | jq -r '.tool_response.agentId // empty' 2>/dev/null)
  if [ -n "$COMPLETED_AGENT_ID" ]; then
    rm -f "$RELAY_DIR/$COMPLETED_AGENT_ID"
    rm -f "$CWD/.claude/context-sessions/${SESSION_ID}_${COMPLETED_AGENT_ID}.json"
  fi
fi

# Read context window size from config, falling back to 200000.
CONTEXT_WINDOW=200000
CONFIG_FILE="$CWD/.kiro/settings/templates/context-config.json"
if [ -f "$CONFIG_FILE" ]; then
  OVERRIDE=$(jq -r '.token_budget_override // empty' "$CONFIG_FILE" 2>/dev/null)
  if [ -n "$OVERRIDE" ] && [ "$OVERRIDE" != "null" ]; then
    CONTEXT_WINDOW=$OVERRIDE
  fi
fi

# Write a context JSON file for the given transcript and file key.
write_context() {
  local file_key="$1"
  local agent_id="$2"
  local transcript="$3"

  local LAST_USAGE
  LAST_USAGE=$(jq -c 'select(.type == "assistant") | .message.usage // empty' \
    "$transcript" 2>/dev/null | tail -1)

  if [ -z "$LAST_USAGE" ] || [ "$LAST_USAGE" = "null" ]; then
    # Normal at session start before any assistant turn — not an error
    return 0
  fi

  local INPUT_TOKENS CACHE_CREATE CACHE_READ USED PERCENTAGE
  INPUT_TOKENS=$(echo "$LAST_USAGE" | jq '.input_tokens // 0')
  CACHE_CREATE=$(echo "$LAST_USAGE" | jq '.cache_creation_input_tokens // 0')
  CACHE_READ=$(echo "$LAST_USAGE" | jq '.cache_read_input_tokens // 0')
  USED=$((INPUT_TOKENS + CACHE_CREATE + CACHE_READ))
  PERCENTAGE=$(awk "BEGIN { printf \"%.1f\", ($USED / $CONTEXT_WINDOW) * 100 }")

  if ! mkdir -p "$CWD/.claude/context-sessions" 2>/dev/null; then
    echo "[cc-sdd] ⚠️  PostToolUse hook: could not create $CWD/.claude/context-sessions/" >&2
    return 0
  fi

  jq -n \
    --arg session_id "$SESSION_ID" \
    --arg agent_id "$agent_id" \
    --argjson used_tokens "$USED" \
    --argjson input_tokens "$INPUT_TOKENS" \
    --argjson cache_creation_tokens "$CACHE_CREATE" \
    --argjson cache_read_tokens "$CACHE_READ" \
    --argjson context_window_size "$CONTEXT_WINDOW" \
    --argjson usage_percentage "$PERCENTAGE" \
    --arg timestamp "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    '{
      session_id: $session_id,
      agent_id: $agent_id,
      used_tokens: $used_tokens,
      input_tokens: $input_tokens,
      cache_creation_tokens: $cache_creation_tokens,
      cache_read_tokens: $cache_read_tokens,
      context_window_size: $context_window_size,
      usage_percentage: $usage_percentage,
      timestamp: $timestamp
    }' > "$CWD/.claude/context-sessions/${file_key}.json"
}

# Update context file for each active subagent (supports parallel execution).
if [ -d "$RELAY_DIR" ] && [ -n "$(ls -A "$RELAY_DIR" 2>/dev/null)" ]; then
  for relay_file in "$RELAY_DIR"/*; do
    AGENT_ID=$(basename "$relay_file")
    SUBAGENT_TRANSCRIPT="${TRANSCRIPT_PATH%.jsonl}/subagents/agent-${AGENT_ID}.jsonl"
    if [ -f "$SUBAGENT_TRANSCRIPT" ]; then
      write_context "${SESSION_ID}_${AGENT_ID}" "$AGENT_ID" "$SUBAGENT_TRANSCRIPT"
    else
      write_context "${SESSION_ID}_${AGENT_ID}" "$AGENT_ID" "$TRANSCRIPT_PATH"
    fi
  done
fi

# Always update the main session context file.
write_context "$SESSION_ID" "" "$TRANSCRIPT_PATH"

exit 0
