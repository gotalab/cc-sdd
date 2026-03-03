#!/bin/bash

# Ralph Loop Check Script (Codex adaptation)
# Manages iteration counting only — task completion judgment is delegated to the agent
# Based on CC plugin's stop-hook.sh: domain-agnostic, iteration-based guard

set -euo pipefail

# --- Argument Parsing ---
TASKS_MD="${1:-}"
STATE_FILE="${2:-}"

if [[ -z "$TASKS_MD" ]] || [[ -z "$STATE_FILE" ]]; then
  echo "Usage: bash scripts/check-loop.sh <tasks-md-path> <state-file-path>" >&2
  exit 1
fi

# TASKS_MD kept for interface compatibility but not used by this script
# Task completion judgment is the agent's responsibility

if [[ ! -f "$STATE_FILE" ]]; then
  echo "Error: State file not found: $STATE_FILE" >&2
  echo "Run 'bash scripts/setup-loop.sh $TASKS_MD' first." >&2
  exit 1
fi

# --- Parse state file frontmatter ---
FRONTMATTER=$(sed -n '/^---$/,/^---$/{ /^---$/d; p; }' "$STATE_FILE")
ITERATION=$(echo "$FRONTMATTER" | grep '^iteration:' | sed 's/iteration: *//')
MAX_ITERATIONS=$(echo "$FRONTMATTER" | grep '^max_iterations:' | sed 's/max_iterations: *//')

# Validate numeric fields
if [[ ! "$ITERATION" =~ ^[0-9]+$ ]] || [[ ! "$MAX_ITERATIONS" =~ ^[0-9]+$ ]]; then
  echo "Error: State file corrupted — iteration or max_iterations is not numeric" >&2
  exit 1
fi

# --- Increment iteration ---
NEXT_ITERATION=$((ITERATION + 1))

# Update iteration in state file
TEMP_FILE="${STATE_FILE}.tmp.$$"
sed "s/^iteration: .*/iteration: $NEXT_ITERATION/" "$STATE_FILE" > "$TEMP_FILE"
mv "$TEMP_FILE" "$STATE_FILE"

# --- Judgment: iteration guard only ---
if [[ "$NEXT_ITERATION" -ge "$MAX_ITERATIONS" ]]; then
  echo "STATUS: MAX_ITERATIONS_REACHED"
  echo "ITERATION: $NEXT_ITERATION/$MAX_ITERATIONS"
  exit 0
fi

echo "STATUS: CONTINUE"
echo "ITERATION: $NEXT_ITERATION/$MAX_ITERATIONS"
