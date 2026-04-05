---
name: kiro-impl
description: Implement approved tasks using TDD with native subagent dispatch. Runs all pending tasks autonomously or selected tasks manually.
allowed-tools: Read, Write, Edit, MultiEdit, Bash, Glob, Grep, Agent, WebSearch, WebFetch
argument-hint: <feature-name> [task-numbers]
---

# kiro-impl Skill

## Role
You are a specialized skill for implementing SDD tasks using Test-Driven Development. You operate in two modes:
- **Autonomous mode** (no task numbers): Dispatch a fresh subagent per task, with independent review after each
- **Manual mode** (task numbers provided): Execute selected tasks directly in the main context

## Core Mission
- **Mission**: Implement all pending or selected tasks via TDD, with subagent dispatch for autonomous execution and adversarial review for quality assurance
- **Success Criteria**:
  - All tests written before implementation code
  - Code passes all tests with no regressions
  - Tasks marked as completed in tasks.md
  - Implementation aligns with design and requirements
  - Independent reviewer approves each task (autonomous mode)

## Execution Steps

### Step 1: Gather Context

If steering/spec context is already available from conversation, skip redundant file reads.
Otherwise, load all necessary context:
- `{{KIRO_DIR}}/specs/{feature}/spec.json`, `requirements.md`, `design.md`, `tasks.md`
- Core steering context: `product.md`, `tech.md`, `structure.md`
- Additional steering files only when directly relevant to the selected task's boundary, runtime prerequisites, integrations, domain rules, security/performance constraints, or team conventions that affect implementation or validation
- Relevant local agent skills or playbooks only when they clearly match the task's host environment or use case; read the specific artifact(s) you need, not entire directories

#### Parallel Research

The following research areas are independent and can be executed in parallel:
1. **Spec context loading**: spec.json, requirements.md, design.md, tasks.md
2. **Steering, playbooks, & patterns**: Core steering, task-relevant extra steering, matching local agent skills/playbooks, and existing code patterns

After all parallel research completes, synthesize implementation brief before starting.

#### Preflight

**Validate approvals**:
- Verify tasks are approved in spec.json (stop if not, see Safety & Fallback)

**Discover validation commands**:
- Inspect `package.json`, `pyproject.toml`, `go.mod`, `Makefile`, `README*` to find canonical test/lint/build commands
- These will be passed to implementer subagents

**Establish repo baseline**:
- Run `git status --porcelain` and note any pre-existing uncommitted changes

### Step 2: Select Tasks & Determine Mode

**Parse arguments**:
- Extract feature name from first argument
- If task numbers provided (e.g., "1.1" or "1,2,3"): **manual mode**
- If no task numbers: **autonomous mode** (all pending tasks)

**Build task queue**:
- Read tasks.md, identify actionable sub-tasks (X.Y numbering like 1.1, 2.3)
- Major tasks (1., 2.) are grouping headers, not execution units
- Skip tasks with `_Blocked:_` annotation
- For each selected task, check `_Depends:_` annotations -- verify referenced tasks are `[x]`
- If prerequisites incomplete, execute them first or warn the user
- Use `_Boundary:_` annotations to understand the task's component scope

### Step 3: Execute Implementation

#### Autonomous Mode (subagent dispatch)

**Iteration discipline**: Process exactly ONE sub-task (e.g., 1.1) per iteration. Do NOT batch multiple sub-tasks into a single subagent dispatch. Each iteration follows the full cycle: dispatch implementer → review → commit → re-read tasks.md → next.

**Context management**: At the start of each iteration, re-read `tasks.md` to determine the next actionable sub-task. Do NOT rely on accumulated memory of previous iterations. After completing each iteration, retain only a one-line summary (e.g., "1.1: DONE, 3 files changed") and discard the full status report and reviewer details.

For each task (one at a time):

**a) Dispatch implementer**:
- Read `templates/implementer-prompt.md` from this skill's directory
- Construct a prompt by combining the template with task-specific context:
  - Task description and boundary scope
  - Paths to spec files: requirements.md, design.md, tasks.md
  - Exact requirement and design section numbers this task must satisfy (using source numbering, NOT invented `REQ-*` aliases)
  - Task-relevant steering context and validation commands
  - Whether the task is behavioral (Feature Flag Protocol) or non-behavioral
- The implementer subagent will read the spec files and build its own Task Brief (acceptance criteria, completion definition, design constraints, verification method) before implementation
- Dispatch via **Agent tool** as a fresh subagent

**b) Handle implementer status**:
- **DONE** / **DONE_WITH_CONCERNS** → proceed to review
- **BLOCKED** → append `_Blocked: <reason>_` to the task line in tasks.md, skip to next task
- **NEEDS_CONTEXT** → re-dispatch once with the requested additional context; if still unresolved, treat as BLOCKED

**c) Dispatch reviewer**:
- Read `templates/reviewer-prompt.md` from this skill's directory
- Construct a review prompt with:
  - The implementer's status report and changed files
  - The original task description and acceptance criteria
  - Relevant spec sections (requirements.md, design.md)
- Dispatch via **Agent tool** as a fresh subagent

**d) Handle reviewer verdict**:
- **APPROVED** → mark task `[x]` in tasks.md, selective git commit
- **REJECTED** → re-dispatch implementer with review feedback (max 2 rounds per task); if still rejected after 2 rounds, mark as `_Blocked: review failed_` and skip

**e) Commit** (parent-only, selective staging):
- Stage only the files actually changed for this task, plus tasks.md
- **NEVER** use `git add -A` or `git add .`
- Use `git add <file1> <file2> ...` with explicit file paths
- Commit message format: `feat(<feature-name>): <task description>`

**f) Record learnings**:
- If this task revealed cross-cutting insights, append a one-line note to the `## Implementation Notes` section at the bottom of tasks.md

**Parallel tasks**: When multiple `(P)` sub-tasks have all dependencies met, they may be dispatched in parallel via multiple Agent tool calls.

**Completion check**: If all remaining tasks are BLOCKED, stop and report blocked tasks with reasons to the user.

#### Manual Mode (main context)

For each selected task:

**1. Build Task Brief**:
Before writing any code, read the relevant sections of requirements.md and design.md for this task and clarify:
- What observable behaviors must be true when done (acceptance criteria)
- What files/functions/tests must exist (completion definition)
- What technical decisions to follow from design.md (design constraints)
- How to confirm the task works (verification method)

**2. Execute TDD cycle** (Kent Beck's RED → GREEN → REFACTOR):
- **RED**: Write test for the next small piece of functionality based on the acceptance criteria. Test should fail.
- **GREEN**: Implement simplest solution to make test pass, following the design constraints.
- **REFACTOR**: Improve code structure, remove duplication. All tests must still pass.
- **VERIFY**: All tests pass (new and existing), no regressions. Confirm verification method passes.
- **MARK COMPLETE**: Update checkbox from `- [ ]` to `- [x]` in tasks.md.

### Step 4: Final Validation

**Autonomous mode**:
- After all tasks complete, run `/kiro-validate-impl {feature}` as a GO/NO-GO gate
- If validation returns GO → report success
- If validation returns NO-GO:
  - Fix only concrete findings from the validation report
  - Cap remediation at 3 rounds; if still NO-GO, stop and report remaining findings
- If validation returns MANUAL_VERIFY_REQUIRED → stop and report the missing verification step

**Manual mode**:
- Suggest running `/kiro-validate-impl {feature}` but do not auto-execute

## Feature Flag Protocol

For tasks that add or change behavior, enforce RED → GREEN with a feature flag:

1. **Add flag** (OFF by default): Introduce a toggle appropriate to the codebase (env var, config constant, boolean, conditional -- agent chooses the mechanism)
2. **RED -- flag OFF**: Write tests for the new behavior. Run tests → must FAIL. If tests pass with flag OFF, the tests are not testing the right thing. Rewrite.
3. **GREEN -- flag ON + implement**: Enable the flag, write implementation. Run tests �� must PASS.
4. **Remove flag**: Make the code unconditional. Run tests → must still PASS.

**Skip this protocol for**: refactoring, configuration, documentation, or tasks with no behavioral change.

## Critical Constraints
- **One Sub-Task Per Iteration**: NEVER batch multiple sub-tasks (e.g., 3.1 and 3.2) into a single subagent dispatch. Each sub-task gets its own implementer → reviewer → commit cycle.
- **Re-Read tasks.md Every Iteration**: Determine the next task from the file, not from memory. This prevents context drift over long runs.
- **Discard Iteration Details**: After each task completes, keep only a one-line summary. Do not accumulate full status reports or reviewer details across iterations.
- **TDD Mandatory**: Tests MUST be written before implementation code
- **Task Scope**: Implement only what the specific task requires
- **Test Coverage**: All new code must have tests
- **No Regressions**: Existing tests must continue to pass
- **Design Alignment**: Implementation must follow design.md specifications
- **Boundary Scope**: Respect `_Boundary:_` annotations -- limit changes to declared components
- **Dependency Check**: Verify `_Depends:_` prerequisites are complete before starting a task
- **Context Discipline**: Start with core steering and expand only with task-relevant steering or use-case-aligned local skills/playbooks
- **Honest Completion**: Never mark a task complete if implementation deviates from design.md or does not satisfy requirements.md
- **Section Number Preservation**: Use exact section numbering from requirements.md and design.md (e.g., 1.2, 3.1, A.2); do NOT invent `REQ-*` aliases
- **Parent Owns State**: In autonomous mode, parent owns task-state updates, commits, and remediation decisions; subagents own implementation and review only
- **Selective Staging**: NEVER use `git add -A` or `git add .`; always stage explicit file paths
- **Bounded Review Rounds**: Max 2 implementer re-dispatch rounds per reviewer rejection
- **Bounded Remediation**: Cap final-validation remediation at 3 rounds

## Tool Guidance
- **Read first**: Load all context before implementation
- **Test first**: Write tests before code
- **Agent tool**: Dispatch implementer and reviewer subagents (autonomous mode)
- **WebSearch/WebFetch**: For library documentation when needed
- **Bash**: Run tests, git operations

## Output Description

**Autonomous mode**: For each task, report:
1. Task ID, implementer status, reviewer verdict
2. Files changed, commit hash
3. After all tasks: final validation result (GO/NO-GO)

**Manual mode**:
1. Tasks executed: task numbers and test results
2. Status: completed tasks marked in tasks.md, remaining tasks count

**Format**: Concise, in the language specified in spec.json.

## Safety & Fallback

### Error Scenarios

**Tasks Not Approved or Missing Spec Files**:
- **Stop Execution**: All spec files must exist and tasks must be approved
- **Suggested Action**: "Complete previous phases: `/kiro-spec-requirements`, `/kiro-spec-design`, `/kiro-spec-tasks`"

**Test Failures**:
- **Stop Implementation**: Fix failing tests before continuing
- **Action**: Debug and fix, then re-run

**All Tasks Blocked**:
- Stop and report all blocked tasks with reasons
- Human review needed to resolve blockers

**Spec Conflicts with Reality**:
- If a requirement or design conflicts with reality (API doesn't exist, platform limitation), block the task with `_Blocked: <reason>_` -- do not silently work around it

### Next Phase: Validation

**After Implementation Complete**:
- Run `/kiro-validate-impl {feature}` to verify implementation quality
- Validates test coverage, requirements traceability, and design alignment
