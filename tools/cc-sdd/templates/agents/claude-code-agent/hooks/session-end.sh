#!/usr/bin/env bash
# cc-sdd SessionEnd hook — deletes the JSON context files created during the session
# to avoid leaving context usage files on disk.

INPUT=$(cat)
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty' 2>/dev/null)
CWD=$(echo "$INPUT" | jq -r '.cwd // empty' 2>/dev/null)

if [ -z "$SESSION_ID" ]; then
  echo "[cc-sdd] ⚠️  SessionEnd hook: session_id missing from payload" >&2
  exit 0
fi

if [ -z "$CWD" ]; then
  echo "[cc-sdd] ⚠️  SessionEnd hook: cwd missing from payload" >&2
  exit 0
fi

CONTEXT_DIR="$CWD/.claude/context-sessions"

if [ ! -d "$CONTEXT_DIR" ]; then
  exit 0
fi

# Delete main session context file
rm -f "$CONTEXT_DIR/${SESSION_ID}.json"

# Delete any subagent context files for this session
rm -f "$CONTEXT_DIR/${SESSION_ID}"_*.json

# Delete relay file if it exists
rm -f "$CONTEXT_DIR/.relay/$SESSION_ID"

exit 0
