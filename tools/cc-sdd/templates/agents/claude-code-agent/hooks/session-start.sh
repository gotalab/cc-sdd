#!/usr/bin/env bash
# cc-sdd SessionStart hook — makes CLAUDE_SESSION_ID available as an env var
# for the duration of the session, so agents can find their own context file.

INPUT=$(cat)
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty' 2>/dev/null)

if [ -n "$SESSION_ID" ] && [ -n "$CLAUDE_ENV_FILE" ]; then
  echo "CLAUDE_SESSION_ID=$SESSION_ID" >> "$CLAUDE_ENV_FILE"
fi

exit 0
