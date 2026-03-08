#!/bin/bash

# Ralph Loop Complete Task Script (Codex / Orchestration Protocol)
# Marks a task as complete in tasks.md and creates a delta-based git commit
# Only stages files changed since the pre-task snapshot — never uses git add -A

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

# --- Git commit with delta-based staging (skip if not a git repo) ---
if git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
  SNAPSHOT_FILE=".ralph-pre-task-snapshot"
  CURRENT_STATUS=$(git status --porcelain 2>/dev/null || true)

  if [[ -f "$SNAPSHOT_FILE" ]]; then
    PREV_STATUS=$(cat "$SNAPSHOT_FILE")

    # Compute delta: files in current status but not in pre-task snapshot
    DELTA_FILES=$(diff <(echo "$PREV_STATUS" | sort) <(echo "$CURRENT_STATUS" | sort) \
      | grep '^>' | sed 's/^> //' | awk '{print $NF}' || true)

    # Stage delta files
    if [[ -n "$DELTA_FILES" ]]; then
      echo "$DELTA_FILES" | while IFS= read -r f; do
        if [[ -e "$f" ]]; then
          git add "$f"
        else
          # File was deleted — stage the deletion
          git add "$f" 2>/dev/null || true
        fi
      done
    fi

    # Always stage tasks.md (task was marked complete)
    git add "$TASKS_MD"

    # Cleanup snapshot
    rm -f "$SNAPSHOT_FILE"
    # Don't stage the snapshot removal — it's a transient file
  else
    # No snapshot — fallback: stage only tasks.md
    echo "Warning: No pre-task snapshot found. Staging only tasks.md." >&2
    git add "$TASKS_MD"
  fi

  # Commit if there are staged changes
  if git diff --cached --quiet 2>/dev/null; then
    echo "No staged changes to commit"
  else
    git commit -m "feat($FEATURE_NAME): $TASK_DESC"
    echo "Committed: feat($FEATURE_NAME): $TASK_DESC"
  fi
else
  echo "Not a git repository — skipped commit"
fi
