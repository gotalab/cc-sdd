---
description: Execute spec tasks using TDD methodology
allowed-tools: Read, Glob, Task
argument-hint: <feature-name> [task-numbers]
---

# spec-impl Orchestrator

You are the orchestrator for TDD implementation. You run in the main session context (not as a subagent), which means you can use the Task tool to spawn executor subagents directly.

## Parse Arguments

- Feature name: `$1`
- Task numbers: `$2` (optional)
  - `"1.1"` → single subtask
  - `"1"` → all subtasks of task 1 (or task 1 itself if leaf)
  - `"1,2,3"` → all subtasks of tasks 1, 2, and 3
  - If not provided: all pending tasks

## Step 1: Validate

- Verify `{{KIRO_DIR}}/specs/$1/` exists
- Verify `{{KIRO_DIR}}/specs/$1/tasks.md` exists

If validation fails, inform user to complete tasks generation first.

## Step 2: Resolve Subtask List

Read `{{KIRO_DIR}}/specs/$1/tasks.md` and build a flat list of subtask units:

1. Determine selected tasks from `$2` (or all unchecked `- [ ]` if not provided)
2. For each selected task:
   - Has subtask entries (lines matching `- [ ] N.M` or `- [x] N.M`) → collect each **pending** subtask individually (e.g., `1.1`, `1.2`)
   - Leaf task (no `N.M` subtask lines) → treat the task itself as a single unit (e.g., `2`)
3. Skip already-completed subtasks (`- [x]`)

Result: a flat ordered list of subtask units (e.g., `["1.1", "1.2", "2", "3.1", "3.2"]`).

## Step 3: Build Execution Plan

Re-read `tasks.md` to identify `(P)` markers. Group the subtask list into execution batches:

- Consecutive `(P)`-marked subtasks with no cross-dependencies → one **parallel batch** (spawn simultaneously)
- All other subtasks → individual **sequential steps**

## Step 4: Execute

Work through batches in order. For each batch:

### Sequential subtask

Spawn one executor and wait for its result:

```
Task(
  subagent_type="spec-tdd-impl-agent",
  description="TDD implementation: subtask {id}",
  prompt="""
Feature: $1
Spec directory: {{KIRO_DIR}}/specs/$1/
Subtask: {id}

File patterns to read:
- {{KIRO_DIR}}/specs/$1/*.{json,md}
- {{KIRO_DIR}}/steering/*.md

TDD Mode: strict (test-first)
"""
)
```

Inspect the return value:
- `STATUS: COMPLETE` → log success, continue to next batch
- `STATUS: PARTIAL_COMPLETION` → re-spawn with continuation context (see Step 5)

### Parallel batch

Spawn all executors in the batch in a single step (multiple Task calls at once, without waiting between them). Then wait for all to complete and inspect each result.

## Step 5: Handle PARTIAL_COMPLETION

When an executor returns `STATUS: PARTIAL_COMPLETION`, re-spawn it with **the same original prompt plus a continuation block appended**:

```
{original executor prompt}

--- CONTINUATION CONTEXT ---
This is a continuation spawn. Previous execution reached context limit.
Subtask: {subtask-id}
Already implemented:
  {progress summary from previous executor}
Files already modified:
  {file list from previous executor}
Remaining work:
  {what remains from previous executor}
Do NOT re-implement what is already done. Continue from where the previous run stopped.
```

Loop re-spawning until the subtask returns `STATUS: COMPLETE`.

If the same subtask returns `PARTIAL_COMPLETION` more than 3 consecutive times, stop and report an error for that subtask, then continue with remaining subtasks.

## Step 6: Final Summary

After all subtasks complete, display:

```
## Implementation Complete

Feature: $1
Subtasks executed: {list}
All tasks marked complete in tasks.md.

{brief per-subtask summary from each executor's COMPLETE report}
```

### Next Steps

- `/kiro:validate-impl $1` — validate implementation against requirements and design
- `/kiro:spec-status $1` — check overall spec progress
