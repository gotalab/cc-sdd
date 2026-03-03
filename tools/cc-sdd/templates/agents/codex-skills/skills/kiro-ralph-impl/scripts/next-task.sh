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

# --- Find the first actionable unchecked task ---
while IFS= read -r line_num_and_text; do
  line_num=$(echo "$line_num_and_text" | cut -d: -f1 | tr -d ' ')
  line_text=$(echo "$line_num_and_text" | cut -d: -f2-)

  # Extract task text (strip leading "- [ ] ")
  task_text=$(echo "$line_text" | sed 's/^\s*- \[ \] //')

  # --- Check dependencies ---
  # Look for _Depends: ..._ pattern in the task text (portable — no grep -P)
  # Match opening _Depends: and strip trailing _ from the value
  deps_raw=$(echo "$task_text" | sed -n 's/.*_Depends: *//p' | sed 's/_[[:space:]]*$//' || true)

  if [[ -n "$deps_raw" ]]; then
    # Parse comma-separated dependency references (e.g., "Task 1.1, Task 1.2")
    BLOCKED_DEPS=()
    IFS=',' read -ra DEP_ITEMS <<< "$deps_raw"
    for dep in "${DEP_ITEMS[@]}"; do
      dep=$(echo "$dep" | xargs)  # trim whitespace
      # Check if this dependency task is completed (marked [x]) in tasks.md
      escaped_dep=$(echo "$dep" | sed 's/[]\/$*.^[]/\\&/g')
      if ! grep -q "^[[:space:]]*- \[x\].*${escaped_dep}" "$TASKS_MD"; then
        BLOCKED_DEPS+=("$dep")
      fi
    done

    if [[ ${#BLOCKED_DEPS[@]} -gt 0 ]]; then
      # This task is blocked — skip and try the next one
      continue
    fi
  fi

  # No dependencies or all dependencies met — this is our task
  echo "NEXT_TASK: $task_text"
  echo "TASK_LINE: $line_num"
  echo "DEPS_STATUS: MET"

  # Save pre-task snapshot for delta-based staging
  git status --porcelain > .ralph-pre-task-snapshot 2>/dev/null || true

  exit 0

# Only match sub-tasks (X.Y pattern) — skip major task headers and _Blocked:_ tasks
done < <(grep -n '^\s*- \[ \]' "$TASKS_MD" | grep '[0-9]\.[0-9]' | grep -v '_Blocked:')

# No actionable tasks found — agent determines ALL_COMPLETE vs ALL_BLOCKED
echo "NEXT_TASK: NONE"
echo "DEPS_STATUS: N/A"
