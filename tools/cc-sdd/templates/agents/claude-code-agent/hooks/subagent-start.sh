#!/usr/bin/env bash
# cc-sdd SubagentStart hook — writes a per-agent relay file so PostToolUse can
# identify all active subagents and update their context files.
#
# CLAUDE_ENV_FILE is NOT set for SubagentStart (only for SessionStart), so env
# var injection is not possible. We use a relay file at:
#   .claude/context-sessions/.relay/{session_id}/{agent_id}
# PostToolUse iterates over all relay files for the session on each tool call,
# supporting parallel subagent execution without race conditions.
# PostToolUse removes a relay file when the corresponding Task tool completes.

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

# Write per-agent relay file: PostToolUse enumerates these to find active agents.
RELAY_DIR="$CWD/.claude/context-sessions/.relay/$SESSION_ID"
mkdir -p "$RELAY_DIR" 2>/dev/null
touch "$RELAY_DIR/$AGENT_ID"

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
