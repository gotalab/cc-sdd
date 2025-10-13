---
description: Execute spec tasks using TDD methodology
allowed-tools: Read, Task
argument-hint: <feature-name> [task-numbers]
---

# Implementation Task Executor

## Parse Arguments
- Feature name: `$1`
- Task numbers: `$2` (optional)
  - Format: "1.1" (single task) or "1,2,3" (multiple tasks)
  - If not provided: Execute all pending tasks

## Validate
Check that tasks have been generated:
- Verify `{{KIRO_DIR}}/specs/$1/` exists
- Verify `{{KIRO_DIR}}/specs/$1/tasks.md` exists

If validation fails, inform user to complete tasks generation first.

## Task Selection Logic

**Parse task numbers from `$2`** (perform this in Slash Command before invoking SubAgent):
- If `$2` provided: Parse task numbers (e.g., "1.1", "1,2,3")
- Otherwise: Read `{{KIRO_DIR}}/specs/$1/tasks.md` and find all unchecked tasks (`- [ ]`)

## Invoke SubAgent

Delegate TDD implementation to spec-tdd-impl-agent:

Use the Task tool to invoke the SubAgent with file path patterns:

```
Task(
  subagent_type="spec-tdd-impl-agent",
  description="Execute TDD implementation",
  prompt="""
Feature: $1
Spec directory: {{KIRO_DIR}}/specs/$1/
Target tasks: {parsed task numbers or "all pending"}

File patterns to read:
- {{KIRO_DIR}}/specs/$1/*.{json,md}
- {{KIRO_DIR}}/steering/*.md

TDD Mode: strict (test-first)
"""
)
```

## Display Result

Show SubAgent summary to user, then provide next step guidance:

### Task Execution

**Execute specific task(s)**:
- `/kiro:spec-impl $1 1.1` - Single task
- `/kiro:spec-impl $1 1,2,3` - Multiple tasks

**Execute all pending**:
- `/kiro:spec-impl $1` - All unchecked tasks

**Before Starting Implementation**:
- **IMPORTANT**: Clear conversation history and free up context before running `/kiro:spec-impl`
- This applies when starting first task OR switching between tasks
- Fresh context ensures clean state and proper task focus
