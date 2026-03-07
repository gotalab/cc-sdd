# SDD Implementation: {{FEATURE_NAME}}

## Context Loading

Read the following files to understand the full implementation context:
1. `{{KIRO_DIR}}/specs/{{FEATURE_NAME}}/tasks.md` — task list and progress
2. `{{KIRO_DIR}}/specs/{{FEATURE_NAME}}/design.md` — architecture and component design
3. `{{KIRO_DIR}}/specs/{{FEATURE_NAME}}/requirements.md` — functional requirements
4. Core steering context: `product.md`, `tech.md`, `structure.md`
5. Additional steering files only when directly relevant to the current task's boundary, runtime prerequisites, integrations, domain rules, security/performance constraints, or team conventions
6. Relevant local agent skills or playbooks only when they clearly match the current task's host environment or use case; load only the specific artifact(s) needed, not whole directories

## Parent Responsibilities

Before starting the implementation loop, the parent Ralph Loop agent must:
- Keep environment/setup work in the parent agent
- Establish a repo baseline with `git status --porcelain`
- Discover canonical validation commands from repo files such as `package.json`, `pyproject.toml`, `go.mod`, `Makefile`, and `README*`
- Keep control of `tasks.md` updates and commits
- Keep control of the final validation gate and any remediation decisions

## Orchestration Protocol

**Initialize**: `bash scripts/setup-loop.sh {{KIRO_DIR}}/specs/{{FEATURE_NAME}}/tasks.md`

**Loop** — repeat until all tasks are complete and final validation passes:

1. **Check loop guard**: `bash scripts/check-loop.sh {{KIRO_DIR}}/specs/{{FEATURE_NAME}}/tasks.md .ralph-loop-state.md`
   - If `STATUS: CONTINUE` → proceed to step 2
   - If `STATUS: MAX_ITERATIONS_REACHED` → report iteration limit and stop
2. **Get next task**: `bash scripts/next-task.sh {{KIRO_DIR}}/specs/{{FEATURE_NAME}}/tasks.md`
   - If `NEXT_TASK: NONE` → **you** determine the reason:
     - Read tasks.md: if all required sub-tasks are `[x]` → proceed to step 8 for final validation
     - If unchecked required sub-tasks remain (all blocked or dep-blocked) → ALL_BLOCKED → report blocked tasks and reasons for human review, then stop the loop
   - If `DEPS_STATUS: MET` → proceed to step 3 with the returned task
3. **Execute TDD implementation**:
   - For `(P)` tasks, multi-file work, or medium-or-larger tasks, spawn a worker agent and use `templates/implementation-worker-prompt.md` as the assignment scaffold
   - For trivial, tightly scoped tasks, the parent agent may implement locally if that is faster
   - Pass: task description, boundary scope, exact requirement/design section numbers as written in `requirements.md` and `design.md`, task-relevant steering context, matching local agent skills/playbooks when applicable, and the validation commands discovered by the parent
   - Worker agents do NOT update `tasks.md` or create commits; they return changed files, exact section coverage, review results, and validation results to the parent after running their own review/fix loop
4. **Verify against spec** — do NOT proceed to step 5 unless ALL pass:
   - [ ] Worker report cites the exact section numbers from `requirements.md` and `design.md` (for example `1.2`, `3.1`, `A.2`) and does not invent `REQ-*` aliases
   - [ ] Implementation satisfies the requirement referenced by this task (re-read requirements.md)
   - [ ] Technical approach matches design.md (if design says "use X", implementation must use X — not a stub/mock/alternative)
   - [ ] Implementation is real production behavior, not a mock/stub/placeholder/fake/TODO-only path unless the task explicitly requires it
   - [ ] Tests run and pass, asserting the behavior described in requirements
   - If any check fails: fix the implementation and re-verify
   - If spec itself conflicts with reality (API doesn't exist, platform limitation, etc.): leave task as `- [ ]`, append `_Blocked: <reason>_` to the task line, and move to next task
5. **Complete task**: `bash scripts/complete-task.sh {{KIRO_DIR}}/specs/{{FEATURE_NAME}}/tasks.md <TASK_LINE> {{FEATURE_NAME}} "<task description>"`
   - This script stages only the files changed since this task started (delta-based) plus tasks.md, then commits
   - Never uses `git add -A` — only task-scoped changes are committed
6. **Record learnings**: If this task revealed cross-cutting insights (platform constraints, API behaviors, pattern discoveries), append a one-line note to the `## Implementation Notes` section at the bottom of tasks.md
7. **Loop back to step 1**: Continue with the next unchecked task
8. **Final validation and remediation**:
   - Load and execute the validation workflow defined by `.agents/skills/kiro-validate-impl/SKILL.md` for `{{FEATURE_NAME}}`
   - Treat this as a feature-level GO/NO-GO gate, not just a re-check of the last task
   - If validation returns GO → report completion and stop the loop
   - If validation returns NO-GO:
     - Fix only the concrete findings from the validation report
     - If a finding maps cleanly to one or more completed tasks, revert those task checkboxes to `[ ]` and return to step 1
     - If a finding is cross-cutting but fixable without reopening tasks, make a focused remediation change, validate locally, commit with `fix(<feature-name>): address final validation findings`, then re-run this step
     - Cap final-validation remediation at 3 rounds; if still NO-GO, stop and report the remaining findings

## Feature Flag Protocol

For tasks that add or change behavior, enforce RED → GREEN with a feature flag:

1. **Add flag** (OFF by default): Introduce a toggle appropriate to the codebase
   (env var, config constant, boolean, conditional — choose the mechanism)
2. **RED — flag OFF**: Write tests for the new behavior. Run tests → must FAIL.
   If tests pass with flag OFF, the tests are not testing the right thing. Rewrite.
3. **GREEN — flag ON + implement**: Enable the flag, write implementation. Run tests → must PASS.
4. **Remove flag**: Make the code unconditional. Run tests → must still PASS.

**Skip this protocol for**: refactoring, configuration, documentation, or tasks with no behavioral change.

## Critical Rules
- ONE sub-task (e.g., 1.1, 1.2) per cycle — major tasks (1, 2) are grouping headers, not execution units
- When multiple `(P)` sub-tasks have all dependencies met, they may run in parallel via sub-agents
- TDD is mandatory: tests before implementation
- Respect `_Boundary:_` annotations
- Verify `_Depends:_` prerequisites before starting
- Do NOT report ALL_TASKS_COMPLETE unless ALL required sub-tasks in tasks.md are `[x]`
- `max_iterations` defaults to 100 and acts only as a simple safety fuse
- Parent agent owns setup/preflight, `tasks.md`, and commits; worker agents own task implementation only
- Worker review must cite exact spec section numbers and concrete code/test evidence before the parent accepts completion
- Final validation must pass before reporting overall completion
- Final-validation remediation is capped at 3 rounds and stays in the parent agent
- Feature Flag Protocol: behavioral tasks must prove RED with flag OFF before implementing GREEN
- If stuck on a task for multiple attempts, leave a TODO comment and move to next task
- Do NOT mark a task complete if the implementation deviates from design.md or does not satisfy requirements.md
- If spec conflicts with reality, block the task with `_Blocked:_` — do not silently work around it
- Keep `## Implementation Notes` concise: one line per insight, only cross-cutting learnings
