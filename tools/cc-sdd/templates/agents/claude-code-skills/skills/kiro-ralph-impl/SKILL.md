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
- **Mission**: Configure and activate a Ralph Loop that implements all pending tasks via TDD, one task per iteration, then runs final feature validation before declaring success
- **Success Criteria**:
  - Ralph Loop state file written with correct configuration
  - First task implementation started
  - All tasks completed autonomously across iterations
  - Final validation passes, or bounded remediation findings are reported honestly without a false completion signal

## Execution Steps

### Step 1: Validate Prerequisites

**Check for active Ralph Loop**:
- If `.claude/ralph-loop.local.md` already exists: Warn user and ask whether to override or cancel

**Preflight: Verify Ralph Loop plugin is installed**:
- Run: `claude plugin list`
- Verify the output includes `ralph-loop@claude-plugins-official` and that it is enabled
- If the plugin is missing or disabled: Stop immediately and report:
  - "Ralph Loop plugin is required before starting `/kiro-ralph-impl`."
  - "Install: `claude plugin install ralph-loop@claude-plugins-official`"
  - "Then re-run `/kiro-ralph-impl {feature}`."

**Check spec approval**:
- Read `{{KIRO_DIR}}/specs/{feature}/spec.json`
- Verify `tasks` phase is approved
- If not approved: Stop and report "Tasks must be approved first. Run `/kiro-spec-tasks {feature}` to generate and approve tasks."

**Count pending tasks**:
- Read `{{KIRO_DIR}}/specs/{feature}/tasks.md`
- Count unchecked required sub-tasks (`- [ ]` with X.Y numbering)
- If zero pending tasks: continue in final-validation-only mode instead of stopping

**Preflight setup stays in the parent agent**:
- Run `git status --porcelain` and note any pre-existing uncommitted changes
- Discover canonical validation commands from the repo root using files such as `package.json`, `pyproject.toml`, `go.mod`, `Makefile`, and `README*`
- Identify any local playbooks or agent skills that clearly match this feature's host environment or use case so they can be passed only to the tasks that need them
- Keep environment/setup work in the parent agent; implementation subagents should receive only task-relevant context plus validation commands

### Step 2: Calculate Configuration

**Parse arguments**:
- Extract feature name from first argument
- Extract `--max-iterations N` if provided

**Calculate max_iterations**:
- If user specified: use that value
- Otherwise: `100`

**Set completion promise**: `ALL_TASKS_COMPLETE` (emit it only after final validation passes)

### Step 3: Generate Ralph Prompt

**Load template**:
- Read `templates/ralph-prompt.md` from this skill's directory
- Replace `{{FEATURE_NAME}}` with the actual feature name
- Replace `{{KIRO_DIR}}` with the actual kiro directory path

**Show plan to user**:
- Display: feature name, pending task count, max_iterations, completion promise
- Display: validation commands the parent agent will use for verification
- Display: final validation gate and remediation cap
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
- Explain that `max_iterations` is a simple safety fuse with a default of 100
- Explain that final validation runs before the completion promise is emitted

**Begin first iteration**:
- Follow the generated prompt's Orchestration Protocol
- Read tasks.md, identify first unchecked task
- Delegate task implementation to the packaged `tdd-task-implementer` subagent, including the exact requirement/design section numbers the task must satisfy

## Critical Constraints
- **Plugin Dependency**: Ralph Loop plugin must already be installed and enabled before this skill starts
- **Parent Owns Setup**: Plugin checks, repo preflight, validation command discovery, task-state updates, and commits stay in the parent agent
- **Tasks Approved**: All spec phases must be complete before starting
- **TDD Mandatory**: Implementation subagent must follow RED → GREEN → REFACTOR cycle
- **One Task Per Iteration**: Keep each Ralph iteration focused on a single task
- **Feature Flag TDD**: Behavioral tasks use feature flag protocol to structurally enforce RED → GREEN transition
- **Honest Completion**: Never output the completion promise unless ALL tasks are genuinely `[x]`
- **Simple Safety Fuse**: `max_iterations` defaults to 100 and exists only to prevent runaway loops
- **Spec Conformance**: Do not mark a task complete if the implementation deviates from design.md or does not satisfy requirements.md
- **Worker Review Required**: Implementation subagent must self-review against the exact requirement/design section numbers and return concrete code/test evidence before the parent accepts completion
- **Final Validation Required**: Execute the packaged `kiro-validate-impl` validation workflow before emitting the completion promise, and treat only `GO` as success
- **Bounded Remediation**: If final validation fails, fix only concrete findings and cap remediation at 3 rounds before stopping without the completion promise

## Tool Guidance
- **Read**: Load spec files, core steering, relevant local playbooks/agent skills, and the ralph-prompt.md template
- **Write**: Create `.claude/ralph-loop.local.md` state file
- **Bash**: Get timestamps
- **Glob**: Find steering files, spec files
- **Grep**: Count pending tasks, verify task status

## Output Description

Display activation summary in the language specified in spec.json:

1. **Configuration**: Feature name, pending tasks, max iterations, completion promise
2. **Status**: Ralph Loop activated, first task being implemented or final-validation-only mode starting

**Format**: Concise activation report, then begin implementation

## Safety & Fallback

### Error Scenarios

**Ralph Loop Plugin Not Installed**:
- **Hard stop**: Do not create `.claude/ralph-loop.local.md` and do not begin implementation
- **Action**: "Install with `claude plugin install ralph-loop@claude-plugins-official`, verify with `claude plugin list`, then re-run `/kiro-ralph-impl {feature}`"

**Tasks Not Approved**:
- **Stop**: Spec phases must be complete
- **Action**: "Run `/kiro-spec-tasks {feature}` first"
