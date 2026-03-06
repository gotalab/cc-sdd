#!/usr/bin/env bash
# cc-sdd PostToolUse hook — parses the session transcript after every tool call
# and writes a context file at .claude/context-sessions/{id}.json so agents can
# check their own context usage mid-execution via a Bash call.
#
# Subagent detection: SubagentStart writes a relay file at
#   .claude/context-sessions/.relay/{session_id}
# containing the current agent_id. This hook reads that file to key subagent
# context files as {session_id}_{agent_id}.json.
# When the Task tool completes (tool_name=Task, tool_response.agentId set),
# the relay file is deleted so the parent session resumes its own file.

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

RELAY_FILE="$CWD/.claude/context-sessions/.relay/$SESSION_ID"

# If this is the Task tool completing, a subagent just finished.
# Delete the relay file and subagent context file so the parent session
# resumes writing its own file, then fall through to write parent's context.
if [ "$TOOL_NAME" = "Task" ]; then
  COMPLETED_AGENT_ID=$(echo "$INPUT" | jq -r '.tool_response.agentId // empty' 2>/dev/null)
  if [ -n "$COMPLETED_AGENT_ID" ] && [ -f "$RELAY_FILE" ]; then
    # Delete subagent context file
    SUBAGENT_CONTEXT="$CWD/.claude/context-sessions/${SESSION_ID}_${COMPLETED_AGENT_ID}.json"
    rm -f "$SUBAGENT_CONTEXT"
    rm -f "$RELAY_FILE"
  fi
fi

# Determine file key and transcript to read.
# Subagents have their own transcript at {session_dir}/subagents/agent-{agent_id}.jsonl
if [ -f "$RELAY_FILE" ]; then
  AGENT_ID=$(cat "$RELAY_FILE")
  FILE_KEY="${SESSION_ID}_${AGENT_ID}"
  SUBAGENT_TRANSCRIPT="${TRANSCRIPT_PATH%.jsonl}/subagents/agent-${AGENT_ID}.jsonl"
  if [ -f "$SUBAGENT_TRANSCRIPT" ]; then
    ACTIVE_TRANSCRIPT="$SUBAGENT_TRANSCRIPT"
  else
    ACTIVE_TRANSCRIPT="$TRANSCRIPT_PATH"
  fi
else
  AGENT_ID=""
  FILE_KEY="$SESSION_ID"
  ACTIVE_TRANSCRIPT="$TRANSCRIPT_PATH"
fi

# Extract usage from the last assistant message in the relevant transcript
LAST_USAGE=$(jq -c 'select(.type == "assistant") | .message.usage // empty' \
  "$ACTIVE_TRANSCRIPT" 2>/dev/null | tail -1)

if [ -z "$LAST_USAGE" ] || [ "$LAST_USAGE" = "null" ]; then
  # Normal at session start before any assistant turn — not an error
  exit 0
fi

INPUT_TOKENS=$(echo "$LAST_USAGE" | jq '.input_tokens // 0')
CACHE_CREATE=$(echo "$LAST_USAGE" | jq '.cache_creation_input_tokens // 0')
CACHE_READ=$(echo "$LAST_USAGE" | jq '.cache_read_input_tokens // 0')

# Context usage = input tokens (same formula used by Claude Code's statusline)
USED=$((INPUT_TOKENS + CACHE_CREATE + CACHE_READ))
CONTEXT_WINDOW=200000
PERCENTAGE=$(awk "BEGIN { printf \"%.1f\", ($USED / $CONTEXT_WINDOW) * 100 }")

if ! mkdir -p "$CWD/.claude/context-sessions" 2>/dev/null; then
  echo "[cc-sdd] ⚠️  PostToolUse hook: could not create $CWD/.claude/context-sessions/" >&2
  exit 0
fi

cat > "$CWD/.claude/context-sessions/$FILE_KEY.json" << EOF
{
  "session_id": "$SESSION_ID",
  "agent_id": "$AGENT_ID",
  "used_tokens": $USED,
  "input_tokens": $INPUT_TOKENS,
  "cache_creation_tokens": $CACHE_CREATE,
  "cache_read_tokens": $CACHE_READ,
  "context_window_size": $CONTEXT_WINDOW,
  "usage_percentage": $PERCENTAGE,
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

exit 0
