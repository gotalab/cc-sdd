---
name: kiro-ralph-impl
description: Start autonomous Ralph Loop implementation for all approved tasks. Requires Ralph Loop plugin.
allowed-tools: Read, Write, Bash, Glob, Grep
argument-hint: <feature-name> [--max-iterations N]
---

# kiro-ralph-impl Skill

## Role
You are a specialized skill for launching autonomous Ralph Loop implementation of all approved SDD tasks.

## Core Mission
- **Mission**: Configure and activate a Ralph Loop that implements all pending tasks via TDD, one task per iteration
- **Success Criteria**:
  - Ralph Loop state file written with correct configuration
  - First task implementation started
  - All tasks completed autonomously across iterations

## Execution Steps

### Step 1: Validate Prerequisites

**Check for active Ralph Loop**:
- If `.claude/ralph-loop.local.md` already exists: Warn user and ask whether to override or cancel

**Warn about Ralph Loop plugin dependency**:
- Display: "This skill requires the Ralph Loop plugin for multi-iteration execution. If the plugin is not installed, only the first task will be executed before the session exits."
- Display: "Install: `claude plugin install ralph-loop@claude-plugins-official`"

**Check spec approval**:
- Read `{{KIRO_DIR}}/specs/{feature}/spec.json`
- Verify `tasks` phase is approved
- If not approved: Stop and report "Tasks must be approved first. Run `/kiro-spec-tasks {feature}` to generate and approve tasks."

**Count pending tasks**:
- Read `{{KIRO_DIR}}/specs/{feature}/tasks.md`
- Count unchecked tasks (`- [ ]`)
- If zero pending tasks: Stop and report "All tasks are already complete."

### Step 2: Calculate Configuration

**Parse arguments**:
- Extract feature name from first argument
- Extract `--max-iterations N` if provided

**Calculate max_iterations**:
- If user specified: use that value
- Otherwise: `min(max(pending_task_count * 3, 6), 30)`

**Set completion promise**: `ALL_TASKS_COMPLETE`

### Step 3: Generate Ralph Prompt

**Load template**:
- Read `templates/ralph-prompt.md` from this skill's directory
- Replace `{{FEATURE_NAME}}` with the actual feature name
- Replace `{{KIRO_DIR}}` with the actual kiro directory path

**Show plan to user**:
- Display: feature name, pending task count, max_iterations, completion promise
- Display the generated prompt summary

### Step 4: Activate Ralph Loop

**Write state file** (`.claude/ralph-loop.local.md`):
```
---
active: true
iteration: 1
max_iterations: {calculated_value}
completion_promise: "ALL_TASKS_COMPLETE"
started_at: "{ISO_8601_timestamp}"
---

{generated_prompt_content}
```

**Display activation message**:
- Report Ralph Loop is active with configuration summary
- Warn about iteration limit and completion promise

**Begin first iteration**:
- Follow the generated prompt's Orchestration Protocol
- Read tasks.md, identify first unchecked task
- Delegate to kent-beck-tdd-developer subagent for TDD implementation

## Critical Constraints
- **Plugin Dependency**: Ralph Loop plugin provides the Stop hook. Without it, only one task executes per session (safe failure)
- **Tasks Approved**: All spec phases must be complete before starting
- **TDD Mandatory**: Implementation subagent must follow RED → GREEN → REFACTOR cycle
- **One Task Per Iteration**: Keep each Ralph iteration focused on a single task
- **Feature Flag TDD**: Behavioral tasks use feature flag protocol to structurally enforce RED → GREEN transition
- **Honest Completion**: Never output the completion promise unless ALL tasks are genuinely `[x]`

## Tool Guidance
- **Read**: Load spec files, steering, ralph-prompt.md template
- **Write**: Create `.claude/ralph-loop.local.md` state file
- **Bash**: Get timestamps
- **Glob**: Find steering files, spec files
- **Grep**: Count pending tasks, verify task status

## Output Description

Display activation summary in the language specified in spec.json:

1. **Configuration**: Feature name, pending tasks, max iterations, completion promise
2. **Status**: Ralph Loop activated, first task being implemented

**Format**: Concise activation report, then begin implementation

## Safety & Fallback

### Error Scenarios

**Ralph Loop Plugin Not Installed**:
- **Safe failure**: First task executes normally, session exits without looping
- **Action**: "Install with `claude plugin install ralph-loop@claude-plugins-official`"

**Tasks Not Approved**:
- **Stop**: Spec phases must be complete
- **Action**: "Run `/kiro-spec-tasks {feature}` first"
