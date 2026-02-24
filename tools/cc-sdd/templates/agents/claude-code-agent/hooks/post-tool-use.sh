#!/usr/bin/env bash
# cc-sdd PostToolUse hook — parses the session transcript after every tool call
# and writes a per-session context file at .claude/context-sessions/{session_id}.json
# so agents can check their own context usage mid-execution via a Bash call.

INPUT=$(cat)
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty' 2>/dev/null)
TRANSCRIPT_PATH=$(echo "$INPUT" | jq -r '.transcript_path // empty' 2>/dev/null)
CWD=$(echo "$INPUT" | jq -r '.cwd // empty' 2>/dev/null)

if [ -z "$SESSION_ID" ] || [ -z "$TRANSCRIPT_PATH" ] || [ -z "$CWD" ] || [ ! -f "$TRANSCRIPT_PATH" ]; then
  exit 0
fi

# Extract usage from the last assistant message in the transcript
LAST_USAGE=$(jq -c 'select(.type == "assistant" and (.message.usage != null)) | .message.usage' \
  "$TRANSCRIPT_PATH" 2>/dev/null | tail -1)

if [ -z "$LAST_USAGE" ] || [ "$LAST_USAGE" = "null" ]; then
  exit 0
fi

INPUT_TOKENS=$(echo "$LAST_USAGE" | jq '.input_tokens // 0')
CACHE_CREATE=$(echo "$LAST_USAGE" | jq '.cache_creation_input_tokens // 0')
CACHE_READ=$(echo "$LAST_USAGE" | jq '.cache_read_input_tokens // 0')

# Context usage = input tokens (Claude Code statusline uses the same formula)
USED=$((INPUT_TOKENS + CACHE_CREATE + CACHE_READ))
CONTEXT_WINDOW=200000
PERCENTAGE=$(awk "BEGIN { printf \"%.1f\", ($USED / $CONTEXT_WINDOW) * 100 }")

mkdir -p "$CWD/.claude/context-sessions"
cat > "$CWD/.claude/context-sessions/$SESSION_ID.json" << EOF
{
  "session_id": "$SESSION_ID",
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
