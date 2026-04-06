---
name: kiro-impl
description: Implement approved tasks using TDD with subagent dispatch. Runs all pending tasks autonomously or selected tasks manually.
---


# kiro-impl Skill

<background_information>
You operate in two modes:
- **Autonomous mode** (no task numbers): Dispatch a fresh sub-agent per task, with independent review after each
- **Manual mode** (task numbers provided): Execute selected tasks directly in the main context

- **Success Criteria**:
  - All tests written before implementation code
  - Code passes all tests with no regressions
  - Tasks marked as completed in tasks.md
  - Implementation aligns with design and requirements
  - Independent reviewer approves each task (autonomous mode)
</background_information>

<instructions>

## Step 1: Gather Context

If steering/spec context is already available from conversation, skip redundant file reads.
Otherwise, load all necessary context:
- `{{KIRO_DIR}}/specs/{feature}/spec.json`, `requirements.md`, `design.md`, `tasks.md`
- Core steering context: `product.md`, `tech.md`, `structure.md`
- Additional steering files only when directly relevant to the selected task's boundary, runtime prerequisites, integrations, domain rules, security/performance constraints, or team conventions that affect implementation or validation
- Relevant local agent skills or playbooks only when they clearly match the task's host environment or use case; read the specific artifact(s) you need, not entire directories

### Parallel Research

The following research areas are independent and can be executed in parallel:
1. **Spec context loading**: spec.json, requirements.md, design.md, tasks.md
2. **Steering, playbooks, & patterns**: Core steering, task-relevant extra steering, matching local agent skills/playbooks, and existing code patterns

After all parallel research completes, synthesize implementation brief before starting.

### Preflight

**Validate approvals**:
- Verify tasks are approved in spec.json (stop if not, see Safety & Fallback)

**Discover validation commands**:
- Inspect `package.json`, `pyproject.toml`, `go.mod`, `Makefile`, `README*` to find canonical test/lint/build commands
- These will be passed to implementer sub-agents

**Establish repo baseline**:
- Run `git status --porcelain` and note any pre-existing uncommitted changes

## Step 2: Select Tasks & Determine Mode

**Parse arguments**:
- Extract feature name from `$1`
- If task numbers provided in `$2` (e.g., "1.1" or "1,2,3"): **manual mode**
- If no task numbers: **autonomous mode** (all pending tasks)

**Build task queue**:
- Read tasks.md, identify actionable sub-tasks (X.Y numbering like 1.1, 2.3)
- Major tasks (1., 2.) are grouping headers, not execution units
- Skip tasks with `_Blocked:_` annotation
- For each selected task, check `_Depends:_` annotations -- verify referenced tasks are `[x]`
- If prerequisites incomplete, execute them first or warn the user
- Use `_Boundary:_` annotations to understand the task's component scope

## Step 3: Execute Implementation

### Autonomous Mode (sub-agent dispatch)

**Iteration discipline**: Process exactly ONE sub-task (e.g., 1.1) per iteration. Do NOT batch multiple sub-tasks into a single sub-agent dispatch. Each iteration follows the full cycle: dispatch implementer → review → commit → re-read tasks.md → next.

**Context management**: At the start of each iteration, re-read `tasks.md` to determine the next actionable sub-task. Do NOT rely on accumulated memory of previous iterations. After completing each iteration, retain only a one-line summary (e.g., "1.1: DONE, 3 files changed") and discard the full status report and reviewer details.

If multi-agent capability is available, for each task (one at a time):

**a) Dispatch implementer**:
- Read `templates/implementer-prompt.md` from this skill's directory
- Construct a prompt by combining the template with task-specific context:
  - Task description and boundary scope
  - Paths to spec files: requirements.md, design.md, tasks.md
  - Exact requirement and design section numbers this task must satisfy (using source numbering, NOT invented `REQ-*` aliases)
  - Task-relevant steering context and validation commands
  - Whether the task is behavioral (Feature Flag Protocol) or non-behavioral
  - **Previous learnings**: Include any `## Implementation Notes` entries from tasks.md that are relevant to this task's boundary or dependencies (e.g., "better-sqlite3 requires separate rebuild for Electron"). This prevents the same mistakes from recurring.
- The implementer sub-agent will read the spec files and build its own Task Brief (acceptance criteria, completion definition, design constraints, verification method) before implementation
- Spawn a fresh sub-agent with this prompt

**b) Handle implementer status**:
- **DONE** / **DONE_WITH_CONCERNS** → proceed to review
- **BLOCKED** → dispatch debug subagent (see section below); do NOT immediately skip
- **NEEDS_CONTEXT** → re-dispatch once with the requested additional context; if still unresolved → dispatch debug subagent

**c) Dispatch reviewer**:
- Read `templates/reviewer-prompt.md` from this skill's directory
- Construct a review prompt with:
  - The task description and relevant spec section numbers
  - Paths to spec files (requirements.md, design.md) so the reviewer can read them directly
  - The implementer's status report (for reference only — reviewer must verify independently)
- The reviewer sub-agent will run `git diff` itself to read the actual code changes and verify against the spec
- Spawn a fresh sub-agent with this prompt

**d) Handle reviewer verdict**:
- **APPROVED** → mark task `[x]` in tasks.md, selective git commit
- **REJECTED (round 1-2)** → re-dispatch implementer with review feedback
- **REJECTED (round 3)** → dispatch debug subagent (see section below)

**e) Commit** (parent-only, selective staging):
- Stage only the files actually changed for this task, plus tasks.md
- **NEVER** use `git add -A` or `git add .`
- Use `git add <file1> <file2> ...` with explicit file paths
- Commit message format: `feat(<feature-name>): <task description>`

**f) Record learnings**:
- If this task revealed cross-cutting insights, append a one-line note to the `## Implementation Notes` section at the bottom of tasks.md

**g) Debug subagent** (triggered by BLOCKED, NEEDS_CONTEXT unresolved, or REJECTED after 2 remediation rounds):

The debug subagent runs in a **fresh context** — it receives only the error information, not the failed implementation history. This avoids the context pollution that causes infinite retry loops.

- Read `templates/debugger-prompt.md` from this skill's directory
- Construct a debug prompt with:
  - The error description / blocker reason / reviewer rejection findings
  - `git diff` of the current uncommitted changes
  - The task description and relevant spec section numbers
  - Paths to spec files so the debugger can read them
- Spawn a fresh sub-agent with this prompt

**Handle debug report**:
- If `REQUIRES_HUMAN: true` → append `_Blocked: <ROOT_CAUSE>_` to tasks.md, skip to next task
- If `REQUIRES_HUMAN: false` → discard the failed implementation (`git checkout .`), then spawn a **new** implementer sub-agent with the debug report's `FIX_PLAN` and `NOTES` included in the prompt alongside the standard task context
  - If the new implementer succeeds (DONE → reviewer APPROVED) → normal flow
  - If the new implementer also fails → repeat debug cycle (max 2 debug rounds total). After 2 failed debug rounds → append `_Blocked: debug attempted twice, still failing — <ROOT_CAUSE>_` to tasks.md, skip
- **Max 2 debug rounds per task**. Each round: fresh debug subagent → fresh implementer. If still failing after 2 rounds, the task is blocked.
- Record debug findings in `## Implementation Notes` (this helps subsequent tasks avoid the same issue)

**`(P)` markers**: Tasks marked `(P)` in tasks.md indicate they have no inter-dependencies and could theoretically run in parallel. However, kiro-impl processes them sequentially (one at a time) to avoid git conflicts and simplify review. The `(P)` marker is informational for task planning, not an execution directive.

**Fallback**: Windsurf does not support programmatic sub-agent dispatch. Execute all tasks sequentially in the main context using the manual mode execution flow below.

### Manual Mode (main context)

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

## Step 4: Final Validation

**Autonomous mode**:
- After all tasks complete, run `@kiro-validate-impl $1` as a GO/NO-GO gate
- If validation returns GO → report success
- If validation returns NO-GO:
  - Fix only concrete findings from the validation report
  - Cap remediation at 3 rounds; if still NO-GO, stop and report remaining findings
- If validation returns MANUAL_VERIFY_REQUIRED → stop and report the missing verification step

**Manual mode**:
- Suggest running `@kiro-validate-impl $1` but do not auto-execute

## Feature Flag Protocol

For tasks that add or change behavior, enforce RED → GREEN with a feature flag:

1. **Add flag** (OFF by default): Introduce a toggle appropriate to the codebase (env var, config constant, boolean, conditional)
2. **RED -- flag OFF**: Write tests for the new behavior. Run tests → must FAIL. If tests pass with flag OFF, the tests are not testing the right thing. Rewrite.
3. **GREEN -- flag ON + implement**: Enable the flag, write implementation. Run tests → must PASS.
4. **Remove flag**: Make the code unconditional. Run tests → must still PASS.

**Skip this protocol for**: refactoring, configuration, documentation, or tasks with no behavioral change.

</instructions>

## Critical Constraints
- **Selective Staging**: NEVER use `git add -A` or `git add .`; always stage explicit file paths
- **Bounded Review Rounds**: Max 2 implementer re-dispatch rounds per reviewer rejection, then debug
- **Bounded Debug**: Max 2 debug rounds per task (debug + re-implementation per round); if still failing → BLOCKED
- **Bounded Remediation**: Cap final-validation remediation at 3 rounds

## Output Description

**Autonomous mode**: For each task, report: task ID, implementer status, reviewer verdict, files changed, commit hash. After all tasks: final validation result.

**Manual mode**: Tasks executed with test results. Status of completed/remaining tasks.

**Format**: Concise, in the language specified in spec.json.

## Safety & Fallback

### Error Scenarios

**Tasks Not Approved or Missing Spec Files**:
- **Stop Execution**: All spec files must exist and tasks must be approved
- **Suggested Action**: "Complete previous phases: `@kiro-spec-requirements`, `@kiro-spec-design`, `@kiro-spec-tasks`"

**Test Failures**:
- **Stop Implementation**: Fix failing tests before continuing
- **Action**: Debug and fix, then re-run

**All Tasks Blocked**:
- Stop and report all blocked tasks with reasons; human review needed

**Spec Conflicts with Reality**:
- Block the task with `_Blocked: <reason>_` -- do not silently work around it

**Session Interrupted**:
- Safe to re-run `@kiro-impl $1` — completed tasks are already `[x]` in tasks.md and committed to git
- The controller re-reads tasks.md on each iteration, so it will pick up where it left off automatically
