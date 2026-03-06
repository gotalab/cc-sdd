#!/usr/bin/env bash
# cc-sdd SubagentStart hook — writes a relay file so PostToolUse can identify
# which agent_id is currently running and key its context file as
# {session_id}_{agent_id}.json instead of the shared session file.
#
# CLAUDE_ENV_FILE is NOT set for SubagentStart (only for SessionStart), so env
# var injection is not possible. We use a relay file at:
#   .claude/context-sessions/.relay/{session_id}
# PostToolUse reads this file to get the current agent_id.
# PostToolUse deletes it when the Task tool completes (subagent is done).

INPUT=$(cat)
AGENT_ID=$(echo "$INPUT" | jq -r '.agent_id // empty' 2>/dev/null)
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty' 2>/dev/null)
CWD=$(echo "$INPUT" | jq -r '.cwd // empty' 2>/dev/null)

if [ -z "$AGENT_ID" ]; then
  echo "[cc-sdd] ⚠️  SubagentStart hook: could not extract agent_id from payload" >&2
  exit 0
fi

if [ -z "$SESSION_ID" ]; then
  echo "[cc-sdd] ⚠️  SubagentStart hook: could not extract session_id from payload" >&2
  exit 0
fi

if [ -z "$CWD" ]; then
  echo "[cc-sdd] ⚠️  SubagentStart hook: could not extract cwd from payload" >&2
  exit 0
fi

# Write relay file: PostToolUse reads this to get the current subagent's ID.
RELAY_DIR="$CWD/.claude/context-sessions/.relay"
mkdir -p "$RELAY_DIR" 2>/dev/null
echo "$AGENT_ID" > "$RELAY_DIR/$SESSION_ID"

# Also emit additionalContext as a prompt-visible reminder for the agent.
jq -n \
  --arg id "$AGENT_ID" \
  --arg sid "$SESSION_ID" \
  '{
    hookSpecificOutput: {
      hookEventName: "SubagentStart",
      additionalContext: ("CLAUDE_AGENT_ID=" + $id + "\nYour context file: .claude/context-sessions/" + $sid + "_" + $id + ".json")
    }
  }'

exit 0
