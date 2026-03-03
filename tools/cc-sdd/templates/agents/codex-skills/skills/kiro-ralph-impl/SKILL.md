---
name: kiro-ralph-impl
description: Autonomous implementation of all approved tasks using iterative TDD with Feature Flag Protocol
---


# Autonomous Ralph Implementation

<background_information>
- **Mission**: Autonomously implement ALL pending tasks via iterative TDD, one task per cycle, without requiring external loop drivers or plugins
- **Success Criteria**:
  - All pending tasks implemented with TDD methodology
  - Feature Flag Protocol applied to behavioral tasks
  - Each task committed individually
  - All tasks marked `[x]` in tasks.md upon completion
</background_information>

<instructions>
## Core Task
Autonomously implement all approved tasks for feature **$1** using an iterative TDD loop driven entirely by this skill.

## Execution Steps

### Step 1: Load Context

**Read all necessary context**:
- `{{KIRO_DIR}}/specs/$1/spec.json`, `requirements.md`, `design.md`, `tasks.md`
- **Entire `{{KIRO_DIR}}/steering/` directory** for complete project memory

#### Parallel Research

The following research areas are independent and can be executed in parallel:
1. **Spec context loading**: spec.json, requirements.md, design.md, tasks.md
2. **Steering & patterns**: Steering files, coding conventions, existing code patterns

After all parallel research completes, synthesize implementation brief before starting TDD.

### Step 2: Validate Prerequisites

**Check spec approval**:
- Verify `tasks` phase is approved in spec.json
- If not approved: Stop and report "Tasks must be approved first. Run `$kiro-spec-tasks $1` to generate and approve tasks."

**Count pending tasks**:
- Count unchecked tasks (`- [ ]`) in tasks.md
- If zero pending tasks: Stop and report "All tasks are already complete."

### Step 3: Read Implementation Protocol

**Load the implementation protocol**:
- Read `templates/ralph-prompt.md` from this skill's directory
- This protocol defines the Orchestration Protocol, Feature Flag Protocol, and Critical Rules
- Follow this protocol strictly for the implementation loop

### Step 4: Implementation Loop

**Initialize**: Run `bash scripts/setup-loop.sh <tasks-md-path>` to create loop state

**Loop** — repeat until check-loop.sh returns ALL_COMPLETE:

1. Run `bash scripts/check-loop.sh <tasks-md-path> .ralph-loop-state.md`
   - If ALL_COMPLETE or MAX_ITERATIONS_REACHED → exit loop, proceed to Step 5
2. Run `bash scripts/next-task.sh <tasks-md-path>` → get next task info
   - If DEPS_STATUS is BLOCKED → skip to next unchecked task
3. **Execute TDD implementation** for the current task:
   - For **behavioral tasks**: Follow Feature Flag Protocol
     1. Add feature flag (OFF by default)
     2. RED: Write tests with flag OFF → tests must FAIL
     3. GREEN: Enable flag + implement → tests must PASS
     4. Remove flag → tests must still PASS
   - For **non-behavioral tasks** (refactoring, config, docs): Standard TDD cycle (RED → GREEN → REFACTOR)
4. Run `bash scripts/complete-task.sh <tasks-md-path> <line> <feature> <description>`
5. Loop back to step 1

### Step 5: Completion

**When ALL tasks are `[x]`**:
- Report completion summary: total tasks implemented, tests passing
- List any TODO comments left for tasks that were partially completed

**IMPORTANT**: Do NOT report completion unless every task in tasks.md is marked `[x]`.

## Critical Constraints
- **Agent-Driven Loop**: No external plugin or hook required — YOU drive the loop by repeating Step 4 until all tasks are done
- **Feature Flag TDD**: Behavioral tasks use feature flag protocol to structurally enforce RED → GREEN transition
- **One Task Per Loop Cycle**: Each cycle focuses on exactly one task
- **TDD Mandatory**: Tests MUST be written before implementation code
- **Honest Completion**: Never report completion unless ALL tasks are genuinely `[x]`
- **Boundary Scope**: Respect `_Boundary:_` annotations — limit changes to declared components
- **Dependency Check**: Verify `_Depends:_` prerequisites are complete before starting a task
</instructions>

## Tool Guidance
- **Read first**: Load all context and ralph-prompt.md protocol before implementation
- **Test first**: Write tests before code in every cycle
- Use **WebSearch/WebFetch** for library documentation when needed
- Use **task list** to track overall progress through the loop

## Output Description

Provide brief summary in the language specified in spec.json:

1. **Tasks Executed**: Total count, individual task results
2. **Status**: All tasks marked in tasks.md, tests passing
3. **Commits**: List of commits created

**Format**: Concise completion report (under 200 words)

## Safety & Fallback

### Error Scenarios

**Tasks Not Approved or Missing Spec Files**:
- **Stop Execution**: All spec files must exist and tasks must be approved
- **Suggested Action**: "Complete previous phases: `$kiro-spec-requirements`, `$kiro-spec-design`, `$kiro-spec-tasks`"

**Test Failures**:
- **Retry**: Debug and fix the failing test, then re-run
- **If stuck**: Leave a TODO comment, mark task with a note, and move to next task

**All Tasks Already Complete**:
- **Stop**: Report "All tasks are already complete. Use `$kiro-validate-impl $1` to validate."
