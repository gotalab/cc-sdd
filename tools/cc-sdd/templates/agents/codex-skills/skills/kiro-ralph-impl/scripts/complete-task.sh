#!/bin/bash

# Ralph Loop Complete Task Script (Codex / Orchestration Protocol)
# Marks a task as complete in tasks.md and creates a git commit
# This script has no CC plugin equivalent — it standardizes task completion

set -euo pipefail

TASKS_MD="${1:-}"
TASK_LINE="${2:-}"
FEATURE_NAME="${3:-}"
TASK_DESC="${4:-}"

if [[ -z "$TASKS_MD" ]] || [[ -z "$TASK_LINE" ]] || [[ -z "$FEATURE_NAME" ]] || [[ -z "$TASK_DESC" ]]; then
  echo "Usage: bash scripts/complete-task.sh <tasks-md-path> <task-line-number> <feature-name> <task-description>" >&2
  echo "" >&2
  echo "Arguments:" >&2
  echo "  tasks-md-path      Path to tasks.md" >&2
  echo "  task-line-number   Line number of the task to mark complete" >&2
  echo "  feature-name       Feature name for commit message (e.g., 'auth')" >&2
  echo "  task-description   Short task description for commit message" >&2
  exit 1
fi

if [[ ! -f "$TASKS_MD" ]]; then
  echo "Error: tasks.md not found: $TASKS_MD" >&2
  exit 1
fi

if [[ ! "$TASK_LINE" =~ ^[0-9]+$ ]]; then
  echo "Error: task-line-number must be a positive integer, got: $TASK_LINE" >&2
  exit 1
fi

# --- Verify the line is an unchecked task ---
LINE_CONTENT=$(sed -n "${TASK_LINE}p" "$TASKS_MD")
if ! echo "$LINE_CONTENT" | grep -q '^\s*- \[ \]'; then
  echo "Error: Line $TASK_LINE is not an unchecked task" >&2
  echo "  Content: $LINE_CONTENT" >&2
  exit 1
fi

# --- Mark task complete: - [ ] → - [x] ---
# Use sed to replace on the specific line (portable macOS/Linux)
TEMP_FILE="${TASKS_MD}.tmp.$$"
sed "${TASK_LINE}s/- \[ \]/- [x]/" "$TASKS_MD" > "$TEMP_FILE"
mv "$TEMP_FILE" "$TASKS_MD"

echo "Marked task complete on line $TASK_LINE"

# --- Git commit ---
git add -A
git commit -m "feat($FEATURE_NAME): $TASK_DESC"

echo "Committed: feat($FEATURE_NAME): $TASK_DESC"
