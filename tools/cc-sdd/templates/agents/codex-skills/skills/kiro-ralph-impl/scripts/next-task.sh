#!/bin/bash

# Ralph Loop Next Task Script (Codex adaptation)
# Identifies the next unchecked task and checks dependency readiness
# Equivalent to the prompt re-injection part of CC plugin's stop-hook.sh

set -euo pipefail

TASKS_MD="${1:-}"

if [[ -z "$TASKS_MD" ]]; then
  echo "Usage: bash scripts/next-task.sh <tasks-md-path>" >&2
  exit 1
fi

if [[ ! -f "$TASKS_MD" ]]; then
  echo "Error: tasks.md not found: $TASKS_MD" >&2
  exit 1
fi

# --- Find the first unchecked task ---
TASK_LINE_NUM=""
TASK_TEXT=""

while IFS= read -r line_num_and_text; do
  line_num=$(echo "$line_num_and_text" | cut -d: -f1 | tr -d ' ')
  line_text=$(echo "$line_num_and_text" | cut -d: -f2-)

  # Extract task text (strip leading "- [ ] ")
  task_text=$(echo "$line_text" | sed 's/^\s*- \[ \] //')

  # --- Check dependencies ---
  # Look for _Depends:_ pattern in the task text
  deps_raw=$(echo "$task_text" | grep -oP '(?<=_Depends:_\s).*' || true)

  if [[ -n "$deps_raw" ]]; then
    # Parse comma-separated dependency references (e.g., "Task 1.1, Task 1.2")
    BLOCKED_DEPS=()
    IFS=',' read -ra DEP_ITEMS <<< "$deps_raw"
    for dep in "${DEP_ITEMS[@]}"; do
      dep=$(echo "$dep" | xargs)  # trim whitespace
      # Check if this dependency task is completed (marked [x]) in tasks.md
      if ! grep -qP '^\s*- \[x\].*'"$(echo "$dep" | sed 's/[]\/$*.^[]/\\&/g')" "$TASKS_MD"; then
        BLOCKED_DEPS+=("$dep")
      fi
    done

    if [[ ${#BLOCKED_DEPS[@]} -gt 0 ]]; then
      # This task is blocked — try the next one but report it
      BLOCKED_LIST=$(IFS=','; echo "${BLOCKED_DEPS[*]}")

      # Still output this task as blocked, caller may want to skip
      echo "NEXT_TASK: $task_text"
      echo "TASK_LINE: $line_num"
      echo "DEPS_STATUS: BLOCKED:$BLOCKED_LIST"
      exit 0
    fi
  fi

  # No dependencies or all dependencies met
  echo "NEXT_TASK: $task_text"
  echo "TASK_LINE: $line_num"
  echo "DEPS_STATUS: MET"
  exit 0

done < <(grep -n '^\s*- \[ \]' "$TASKS_MD")

# No unchecked tasks found
echo "NEXT_TASK: NONE"
echo "DEPS_STATUS: N/A"
