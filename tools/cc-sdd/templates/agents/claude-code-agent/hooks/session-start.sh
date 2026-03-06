#!/usr/bin/env bash
# cc-sdd SessionStart hook — makes CLAUDE_SESSION_ID available as an env var
# for the duration of the session, so agents can find their own context file.

INPUT=$(cat)
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty' 2>/dev/null)

if [ -z "$SESSION_ID" ]; then
  echo "[cc-sdd] ⚠️  SessionStart hook: could not extract session_id from payload" >&2
  exit 0
fi

if [ -z "$CLAUDE_ENV_FILE" ]; then
  echo "[cc-sdd] ⚠️  SessionStart hook: CLAUDE_ENV_FILE is not set — CLAUDE_SESSION_ID will not be available in this session" >&2
  exit 0
fi

echo "CLAUDE_SESSION_ID=$SESSION_ID" >> "$CLAUDE_ENV_FILE"
exit 0
