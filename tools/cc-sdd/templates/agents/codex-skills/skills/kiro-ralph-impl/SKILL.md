---
name: kiro-ralph-impl
description: Autonomous implementation of all approved tasks using iterative TDD with Feature Flag Protocol
---


# Autonomous Ralph Implementation

<background_information>
- **Mission**: Autonomously implement ALL pending tasks via iterative TDD, one task per cycle, then run final feature validation before declaring success
- **Success Criteria**:
  - All pending tasks implemented with TDD methodology
  - Feature Flag Protocol applied to behavioral tasks
  - Each task committed individually
  - All tasks marked `[x]` in tasks.md upon completion
  - Final validation passes, or bounded remediation findings are reported honestly without a false success claim
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
3. **Validation discovery**: repo files such as `package.json`, `pyproject.toml`, `go.mod`, `Makefile`, and `README*` to determine canonical validation commands

If multi-agent is enabled, spawn sub-agents for each area above. Otherwise execute sequentially.

After all parallel research completes, synthesize implementation brief before starting TDD.

### Step 2: Validate Prerequisites

**Check spec approval**:
- Verify `tasks` phase is approved in spec.json
- If not approved: Stop and report "Tasks must be approved first. Run `$kiro-spec-tasks $1` to generate and approve tasks."

**Count pending tasks**:
- Count unchecked required sub-tasks (`- [ ]` with X.Y numbering) in tasks.md
- If zero pending tasks: skip Step 4 and go directly to Step 5 for final validation

**Keep setup in the manager**:
- Run `git status --porcelain` and note pre-existing changes before starting the loop
- Keep environment/setup, validation command discovery, task-state updates, and commits in the parent Ralph Loop agent

### Step 3: Read Implementation Protocol

**Load the implementation protocol**:
- Read `templates/ralph-prompt.md` from this skill's directory
- This protocol defines the Orchestration Protocol, Feature Flag Protocol, and Critical Rules
- Follow this protocol strictly for the implementation loop

### Step 4: Implementation Loop

**Initialize**: Run `bash scripts/setup-loop.sh <tasks-md-path>` to create loop state

**Loop** — repeat until all tasks are complete:

1. Run `bash scripts/check-loop.sh <tasks-md-path> .ralph-loop-state.md`
   - If `STATUS: CONTINUE` → proceed to step 2
   - If `STATUS: MAX_ITERATIONS_REACHED` → exit loop, proceed to Step 5
2. Run `bash scripts/next-task.sh <tasks-md-path>` → get next task info
   - If `NEXT_TASK: NONE` → **you** determine the reason:
     - All sub-tasks `[x]` → ALL_COMPLETE → exit loop, proceed to Step 5
     - Unchecked sub-tasks remain (all blocked) → ALL_BLOCKED → report and stop
   - If `DEPS_STATUS: MET` → proceed to step 3
3. **Execute TDD implementation** for the current task:
   - If the task is marked `(P)`, spans multiple files, or needs non-trivial implementation: spawn a worker agent and use `templates/implementation-worker-prompt.md` as the assignment scaffold
   - If the task is trivial and tightly scoped: implement locally in the parent agent
   - In both cases, keep setup/preflight, task-state updates, and commits in the parent agent
   - Worker-delivered implementations must cite the exact requirement/design section numbers they satisfy and include concrete code/test evidence after a self-review loop
4. Run `bash scripts/complete-task.sh <tasks-md-path> <line> <feature> <description>`
5. Loop back to step 1

### Step 5: Final Validation and Remediation

- Load and execute the validation workflow defined by `../kiro-validate-impl/SKILL.md` for `$1`
- Treat this as a feature-level GO/NO-GO gate, not just a re-check of the last task
- If validation returns GO: proceed to Step 6
- If validation returns NO-GO:
  - Fix only the concrete findings from the validation report
  - If a finding maps cleanly to one or more completed tasks, revert those task checkboxes to `[ ]` and return to Step 4
  - If a finding is cross-cutting but fixable without reopening tasks, make a focused remediation change, commit with `fix(<feature-name>): address final validation findings`, and re-run this step
  - Cap final-validation remediation at 3 rounds; if still NO-GO, stop and report the remaining findings without claiming success

### Step 6: Completion

**When ALL tasks are `[x]` and final validation is GO**:
- Report completion summary: total tasks implemented, final validation GO, tests passing
- List any TODO comments left for tasks that were partially completed

**IMPORTANT**: Do NOT report completion unless every task in tasks.md is marked `[x]` and final validation has passed.

## Critical Constraints
- **Agent-Driven Loop**: No external plugin or hook required — YOU drive the loop by repeating Step 4 until all tasks are done
- **Parent Owns Setup**: Environment readiness, validation command discovery, task-state updates, and commits stay in the parent agent
- **Feature Flag TDD**: Behavioral tasks use feature flag protocol to structurally enforce RED → GREEN transition
- **One Task Per Loop Cycle**: Each cycle focuses on exactly one task
- **TDD Mandatory**: Tests MUST be written before implementation code
- **Honest Completion**: Never report completion unless ALL tasks are genuinely `[x]`
- **Simple Safety Fuse**: `max_iterations` defaults to 100 and exists only to prevent runaway loops
- **Boundary Scope**: Respect `_Boundary:_` annotations — limit changes to declared components
- **Dependency Check**: Verify `_Depends:_` prerequisites are complete before starting a task
- **Spec Conformance**: Do not mark a task complete if the implementation deviates from design.md or does not satisfy requirements.md
- **Worker Review Required**: Worker agents must self-review against the exact requirement/design section numbers and return concrete code/test evidence before the parent accepts completion
- **Final Validation Required**: Run the `kiro-validate-impl` validation workflow before reporting success
- **Bounded Remediation**: If final validation fails, fix only concrete findings and cap remediation at 3 rounds before stopping
</instructions>

## Tool Guidance
- **Read first**: Load all context and ralph-prompt.md protocol before implementation
- **Test first**: Write tests before code in every cycle
- Use **WebSearch/WebFetch** for library documentation when needed
- Use **task list** to track overall progress through the loop

## Output Description

Provide brief summary in the language specified in spec.json:

1. **Tasks Executed**: Total count, individual task results
2. **Status**: All tasks marked in tasks.md, final validation result, tests passing
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
- **Action**: Skip implementation and run the final validation gate immediately
