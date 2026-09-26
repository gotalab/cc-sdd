---
name: kiro-ralph-impl
description: Implement approved tasks using TDD with native sub-agent dispatch, subtask/task selection, and context window management. Runs all pending tasks or selected tasks/subtasks.
disable-model-invocation: true
allowed-tools: Read, Write, Edit, MultiEdit, Bash, Glob, Grep, Agent, WebSearch, WebFetch
argument-hint: <feature-name> [task-numbers] [--review required|inline|off]
---

# kiro-ralph-impl Skill

## Role
You are the orchestrator for TDD implementation with context window management. You run in the main session context and dispatch executor, reviewer, and debugger sub-agents.

## Core Mission
- **Success Criteria**:
  - All tests written before implementation code
  - Code passes all tests with no regressions
  - Tasks marked as completed in tasks.md
  - Implementation aligns with design and requirements
  - Task completion follows the selected review mode

## Review Mode
- Default review mode is `required`
- Accept explicit forms: `--review required|inline|off`
- Also accept clear natural-language opt-outs such as `skip review` or `without review` as `off`
- If the request is ambiguous, keep `required`

## Execution Steps

### Step 1: Gather Context

If steering/spec context is already available from conversation, skip redundant file reads.
Otherwise, load all necessary context:
- `{{KIRO_DIR}}/specs/{feature}/spec.json`, `requirements.md`, `design.md`, `tasks.md`
- Core steering context: `product.md`, `tech.md`, `structure.md`
- Additional steering files only when directly relevant to the selected task's boundary, runtime prerequisites, integrations, domain rules, security/performance constraints, or team conventions
- Relevant local agent skills or playbooks only when they clearly match the task's host environment; read the specific artifact(s) you need, not entire directories

#### Parallel Research
The following research areas are independent and can be executed in parallel:
1. **Spec context loading**: spec.json, requirements.md, design.md, tasks.md
2. **Steering, playbooks, & patterns**: Core steering, task-relevant extra steering, matching local agent skills/playbooks, and existing code patterns

After all parallel research completes, synthesize implementation brief before starting.

#### Preflight
**Validate approvals**:
- Verify tasks are approved in spec.json (stop if not, see Safety & Fallback)

**Discover validation commands**:
- Inspect repository-local sources of truth in this order: project scripts/manifests (`package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, app manifests), task runners (`Makefile`, `justfile`), CI/workflow files, existing e2e/integration configs, then `README*`
- Derive a canonical validation set for this repo: `TEST_COMMANDS`, `BUILD_COMMANDS`, and `SMOKE_COMMANDS`
- Prefer commands already used by repo automation over ad hoc shell pipelines
- For `SMOKE_COMMANDS`, choose the lightest trustworthy runtime-liveness check for the app shape (for example: root URL load, Electron launch, CLI `--help`, service health endpoint, mobile simulator/e2e harness if one already exists)
- Keep the full command set in the parent context, and pass only the task-relevant subset to implementer and reviewer sub-agents

**Establish repo baseline**:
- Run `git status --porcelain` and note any pre-existing uncommitted changes

### Step 2: Select Tasks & Determine Mode

**Parse arguments**:
- Extract feature name from first argument (e.g. `feature-name`)
- Extract task numbers from second argument (optional)
  - `1.1` → single subtask
  - `1` → all subtasks of task 1 (or task 1 itself if leaf)
  - `1,2,3` → all subtasks of tasks 1, 2, and 3
  - If not provided: all pending tasks
- Determine review mode from the invocation:
  - `--review required` or omitted → `required`
  - `--review inline` → `inline`
  - `--review off`, `skip review`, or `without review` → `off`

**Resolve Subtask List**:
Read `{{KIRO_DIR}}/specs/{feature}/tasks.md` and build a flat list of subtask units:
1. Determine selected tasks from the argument (or all unchecked `- [ ]` if not provided)
2. For each selected task:
   - Skip tasks with `_Blocked:_` annotation
   - Check `_Depends:_` annotations -- verify referenced tasks are `[x]`. If prerequisites incomplete, execute them first or warn the user.
   - Use `_Boundary:_` annotations to understand the task's component scope
   - Has subtask entries (lines matching `- [ ] N.M` or `- [x] N.M`) → collect each **pending** subtask individually (e.g., `1.1`, `1.2`)
   - Leaf task (no `N.M` subtask lines) → treat the task itself as a single unit (e.g., `2`)
3. Skip already-completed subtasks (`- [x]`)

Result: a flat ordered list of subtask units (e.g., `["1.1", "1.2", "2"]`).

### Step 3: Execute Implementation

#### Autonomous Mode (sub-agent dispatch)

**Iteration discipline**: Process exactly ONE sub-task (e.g., 1.1) per iteration. Do NOT batch multiple sub-tasks into a single sub-agent dispatch. Each iteration follows the full cycle: dispatch implementer → review → commit → re-read tasks.md → next.

**Context management**: At the start of each iteration, re-read `tasks.md` to determine the next actionable sub-task. Do NOT rely on accumulated memory of previous iterations. After completing each iteration, retain only a one-line summary (e.g., "1.1: READY_FOR_REVIEW, 3 files changed") and discard the full status report and reviewer details.

For each subtask unit:

**a) Dispatch implementer**:
- Read `templates/implementer-prompt.md` from this skill's directory
- Construct a prompt by combining the template with task-specific context:
  - Task description and boundary scope
  - Paths to spec files: requirements.md, design.md, tasks.md
  - Exact requirement and design section numbers this task must satisfy (using source numbering)
  - Task-relevant steering context and parent-discovered validation commands (tests/build/smoke as relevant)
  - Whether the task is behavioral (Feature Flag Protocol) or non-behavioral
  - **Previous learnings**: Include any `## Implementation Notes` entries from tasks.md that are relevant to this task's boundary or dependencies.
- Spawn a fresh sub-agent with this prompt

**b) Handle implementer status**:
- Parse implementer status only from the exact `## Status Report` block and `- STATUS:` field.
- If `STATUS` is missing, ambiguous, or replaced with prose, re-dispatch the implementer once requesting the exact structured status block only. Do NOT proceed to review without a parseable status.
- **READY_FOR_REVIEW** → proceed to review
- **BLOCKED** → dispatch debug sub-agent (see section below)
- **NEEDS_CONTEXT** → re-dispatch once with the requested additional context; if still unresolved → dispatch debug sub-agent
- **PARTIAL_COMPLETION** → re-spawn the implementer with **the same original prompt plus a continuation block appended**:
  ```
  --- CONTINUATION CONTEXT ---
  This is a continuation spawn. Previous execution reached context limit.
  Task: {id}
  Already implemented:
    {PROGRESS_SUMMARY from previous executor}
  Files already modified:
    {FILES_CHANGED from previous executor}
  Remaining work:
    {REMAINING_WORK from previous executor}
  Do NOT re-implement what is already done. Continue from where the previous run stopped.
  ```
  Loop re-spawning until the task returns `READY_FOR_REVIEW` or another final status.
  If the same task returns `PARTIAL_COMPLETION` more than 3 consecutive times, stop and mark as blocked.

**c) Review the task**:
- If review mode is `required`:
  - Read `templates/reviewer-prompt.md` from this skill's directory
  - Construct a review prompt with:
    - The task description and relevant spec section numbers
    - Paths to spec files (requirements.md, design.md) so the reviewer can read them directly
    - The implementer's status report (for reference only)
  - The reviewer must apply the `kiro-review` protocol to this task-local review.
  - Preserve the existing task-specific context: task text, spec refs, `_Boundary:_` scope, validation commands, implementer report, and the actual `git diff` as the primary source of truth.
  - Spawn a fresh sub-agent with this prompt
- If review mode is `inline`:
  - Apply `kiro-review` in the parent context using the same task evidence and the actual `git diff`
- If review mode is `off`:
  - Skip task-local review

**d) Handle reviewer verdict**:
- If review mode is `off`:
  - Do not fabricate a reviewer verdict
  - Before marking the task `[x]` or making any success claim, apply `kiro-verify-completion` using fresh evidence from the current code state; then mark task `[x]` in tasks.md and perform selective git commit
- Otherwise:
  - Parse reviewer verdict only from the exact `## Review Verdict` block and `- VERDICT:` field.
  - If `VERDICT` is missing, ambiguous, or replaced with prose, re-dispatch the reviewer once requesting the exact structured verdict only.
  - **APPROVED** → before marking the task `[x]` or making any success claim, apply `kiro-verify-completion` using fresh evidence from the current code state; then mark task `[x]` in tasks.md and perform selective git commit
  - **REJECTED (round 1-2)** → re-dispatch implementer with review feedback
  - **REJECTED (round 3)** → dispatch debug sub-agent (see section below)

**e) Commit** (parent-only, selective staging):
- Stage only the files actually changed for this task, plus tasks.md
- **NEVER** use `git add -A` or `git add .`
- Use `git add <file1> <file2> ...` with explicit file paths
- Commit message format: `feat(<feature-name>): <task description>`

**f) Record learnings**:
- If this task revealed cross-cutting insights, append a one-line note to the `## Implementation Notes` section at the bottom of tasks.md

**g) Debug sub-agent** (triggered by BLOCKED, NEEDS_CONTEXT unresolved, or REJECTED after 2 remediation rounds):
- Read `templates/debugger-prompt.md` from this skill's directory
- Construct a debug prompt with the failure details, current `git diff`, task description, and spec refs.
- Spawn a fresh sub-agent with this prompt.
- **Handle debug report**:
  - Parse `NEXT_ACTION` from the debug report's exact structured field.
  - If `NEXT_ACTION: STOP_FOR_HUMAN` → append `_Blocked: <ROOT_CAUSE>_` to tasks.md, stop the feature run, and report that human review is required.
  - If `NEXT_ACTION: BLOCK_TASK` → append `_Blocked: <ROOT_CAUSE>_` to tasks.md, skip to next task.
  - If `NEXT_ACTION: RETRY_TASK` → preserve the current worktree; spawn a **new** implementer sub-agent with the debug report's `FIX_PLAN`, `NOTES`, and the current `git diff`.
  - Max 2 debug rounds per task.
  - Record debug findings in `## Implementation Notes` (this helps subsequent tasks avoid the same issue).

**`(P)` markers**: Tasks marked `(P)` in tasks.md indicate they have no inter-dependencies and could theoretically run in parallel. However, kiro-ralph-impl processes them sequentially (one at a time) to avoid git conflicts and simplify review.

**Completion check**: If all remaining tasks are BLOCKED, stop and report blocked tasks with reasons to the user.

**Fallback**: If multi-agent is not available, fall back to manual mode execution for all tasks.

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
- **REVIEW**:
  - `required`: Apply `kiro-review` before marking the task complete. If the host supports fresh subagents in manual mode, use a fresh reviewer; otherwise perform the review in the main context using the `kiro-review` protocol. Do NOT continue until the verdict is parseably `APPROVED`.
  - `inline`: Apply `kiro-review` in the main context before marking the task complete.
  - `off`: Skip task-local review, but note that `kiro-validate-impl` becomes the primary quality gate before any feature-level completion claim.
- **MARK COMPLETE**:
  - `required|inline`: Only after review returns `APPROVED`, apply `kiro-verify-completion`, then update the checkbox from `- [ ]` to `- [x]` in tasks.md.
  - `off`: Apply `kiro-verify-completion`, then update the checkbox from `- [ ]` to `- [x]` in tasks.md.

### Step 5: Final Validation
- After all tasks complete, run `/kiro-validate-impl {feature}` as a GO/NO-GO gate.
- If validation returns GO → before reporting feature success, apply `kiro-verify-completion` to the feature-level claim.
- If validation returns NO-GO:
  - Fix only concrete findings from the validation report.
  - Cap remediation at 3 rounds; if still NO-GO, stop and report remaining findings.
- If validation returns MANUAL_VERIFY_REQUIRED → stop and report the missing verification step.

## Feature Flag Protocol
For tasks that add or change behavior, enforce RED → GREEN with a feature flag:
1. **Add flag** (OFF by default): Introduce a toggle appropriate to the codebase.
2. **RED -- flag OFF**: Write tests for the new behavior. Run tests → must FAIL.
3. **GREEN -- flag ON + implement**: Enable the flag, write implementation. Run tests → must PASS.
4. **Remove flag**: Make the code unconditional. Run tests → must still PASS.

Skip this protocol for: refactoring, configuration, documentation, or tasks with no behavioral change.

## Critical Constraints
- **Strict Handoff Parsing**: Never infer implementer `STATUS` or reviewer `VERDICT` from surrounding prose.
- **No Destructive Reset**: Never use `git checkout .`, `git reset --hard`, or similar destructive rollback inside the implementation loop.
- **Selective Staging**: NEVER use `git add -A` or `git add .`; always stage explicit file paths.
- **Bounded Review Rounds**: Max 2 implementer re-dispatch rounds per reviewer rejection, then debug.
- **Bounded Debug**: Max 2 debug rounds per task.
- **Bounded Remediation**: Cap final-validation remediation at 3 rounds.

## Output Description
For each task, report: task ID, implementer status, reviewer verdict, files changed, commit hash. After all tasks: final validation result.

Format: Concise, in the language specified in spec.json.

## Safety & Fallback

### Error Scenarios
**Tasks Not Approved or Missing Spec Files**:
- **Stop Execution**: All spec files must exist and tasks must be approved.
- **Suggested Action**: "Complete previous phases: `/kiro-spec-requirements`, `/kiro-spec-design`, `/kiro-spec-tasks`"

**Test Failures**:
- **Stop Implementation**: Fix failing tests before continuing.

**All Tasks Blocked**:
- Stop and report all blocked tasks with reasons; human review needed.

**Spec Conflicts with Reality**:
- Block the task with `_Blocked: <reason>_` -- do not silently work around it.

**Upstream Ownership Detected**:
- Route the fix back to the owning upstream spec, keep the downstream task blocked until that contract is repaired.

**Task Plan Invalidated During Implementation**:
- If debug returns `NEXT_ACTION: STOP_FOR_HUMAN` because of task ordering, boundary, or decomposition problems, stop and return for human review of `tasks.md` or the approved plan instead of forcing a code workaround.

**Session Interrupted**:
- Safe to re-run `/kiro-ralph-impl $1` — completed tasks are already `[x]` in tasks.md and committed to git.
