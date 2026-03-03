#!/bin/bash

# Ralph Loop Setup Script (Codex adaptation)
# Creates state file for task-driven implementation loop
# Based on CC plugin's setup-ralph-loop.sh, adapted for tasks.md-based completion

set -euo pipefail

# --- Argument Parsing ---
TASKS_MD=""
MAX_ITERATIONS=0

while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      cat << 'HELP_EOF'
Ralph Loop Setup - Initialize implementation loop state

USAGE:
  bash scripts/setup-loop.sh <tasks-md-path> [OPTIONS]

ARGUMENTS:
  <tasks-md-path>    Path to tasks.md file

OPTIONS:
  --max-iterations <n>  Override auto-calculated max iterations
  -h, --help            Show this help message

DESCRIPTION:
  Initializes the Ralph implementation loop by:
  1. Counting pending tasks in tasks.md
  2. Auto-calculating max_iterations: min(max(pending * 3, 6), 30) + 5
  3. Creating .ralph-loop-state.md state file

EXAMPLES:
  bash scripts/setup-loop.sh .kiro/specs/auth/tasks.md
  bash scripts/setup-loop.sh .kiro/specs/auth/tasks.md --max-iterations 20
HELP_EOF
      exit 0
      ;;
    --max-iterations)
      if [[ -z "${2:-}" ]] || [[ ! "$2" =~ ^[0-9]+$ ]]; then
        echo "Error: --max-iterations requires a positive integer" >&2
        exit 1
      fi
      MAX_ITERATIONS="$2"
      shift 2
      ;;
    *)
      if [[ -z "$TASKS_MD" ]]; then
        TASKS_MD="$1"
      else
        echo "Error: Unexpected argument: $1" >&2
        exit 1
      fi
      shift
      ;;
  esac
done

# --- Validation ---
if [[ -z "$TASKS_MD" ]]; then
  echo "Error: tasks.md path is required" >&2
  echo "Usage: bash scripts/setup-loop.sh <tasks-md-path> [--max-iterations N]" >&2
  exit 1
fi

if [[ ! -f "$TASKS_MD" ]]; then
  echo "Error: tasks.md not found: $TASKS_MD" >&2
  exit 1
fi

# --- Count pending tasks ---
# Count only sub-tasks (X.Y pattern) — major task headers are grouping, not execution units
PENDING=$(grep '^\s*- \[ \]' "$TASKS_MD" | grep -c '[0-9]\.[0-9]' || true)

if [[ "$PENDING" -eq 0 ]]; then
  echo "No pending tasks found in $TASKS_MD. Nothing to do."
  exit 0
fi

# --- Calculate max_iterations ---
if [[ "$MAX_ITERATIONS" -eq 0 ]]; then
  # Formula: min(max(pending * 3, 6), 30) + 5
  CALC=$((PENDING * 3))
  if [[ $CALC -lt 6 ]]; then CALC=6; fi
  if [[ $CALC -gt 30 ]]; then CALC=30; fi
  MAX_ITERATIONS=$((CALC + 5))
fi

# --- Create state file ---
STATE_FILE=".ralph-loop-state.md"

cat > "$STATE_FILE" <<EOF
---
iteration: 0
max_iterations: $MAX_ITERATIONS
pending_initial: $PENDING
started_at: "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
tasks_md: "$TASKS_MD"
---
EOF

# --- Output setup message ---
cat <<EOF
Ralph loop initialized.

  Tasks file:       $TASKS_MD
  Pending tasks:    $PENDING
  Max iterations:   $MAX_ITERATIONS
  State file:       $STATE_FILE

Run 'bash scripts/check-loop.sh $TASKS_MD $STATE_FILE' to check loop status.
EOF
