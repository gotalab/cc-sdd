# SDD Implementation: {{FEATURE_NAME}}

## Context Loading

Read the following files to understand the full implementation context:
1. `{{KIRO_DIR}}/specs/{{FEATURE_NAME}}/tasks.md` — task list and progress
2. `{{KIRO_DIR}}/specs/{{FEATURE_NAME}}/design.md` — architecture and component design
3. `{{KIRO_DIR}}/specs/{{FEATURE_NAME}}/requirements.md` — functional requirements
4. Entire `{{KIRO_DIR}}/steering/` directory — project conventions and patterns

## Orchestration Protocol

**Initialize**: `bash scripts/setup-loop.sh {{KIRO_DIR}}/specs/{{FEATURE_NAME}}/tasks.md`

**Loop** — repeat until all tasks are complete:

1. **Check loop guard**: `bash scripts/check-loop.sh {{KIRO_DIR}}/specs/{{FEATURE_NAME}}/tasks.md .ralph-loop-state.md`
   - If `STATUS: CONTINUE` → proceed to step 2
   - If `STATUS: MAX_ITERATIONS_REACHED` → report iteration limit and stop
2. **Get next task**: `bash scripts/next-task.sh {{KIRO_DIR}}/specs/{{FEATURE_NAME}}/tasks.md`
   - If `NEXT_TASK: NONE` → **you** determine the reason:
     - Read tasks.md: if all sub-tasks are `[x]` → ALL_COMPLETE → report completion and stop the loop
     - If unchecked sub-tasks remain (all blocked or dep-blocked) → ALL_BLOCKED → report blocked tasks and reasons for human review, then stop the loop
   - If `DEPS_STATUS: MET` → proceed to step 3 with the returned task
3. **Execute TDD implementation** directly:
   - Use: task description, boundary scope, relevant design.md sections, steering context
   - For behavioral tasks: follow the Feature Flag Protocol (flag OFF → RED → flag ON → GREEN → remove flag)
   - For non-behavioral tasks (refactoring, config): standard TDD cycle
4. **Verify against spec** — do NOT proceed to step 5 unless ALL pass:
   - [ ] Implementation satisfies the requirement referenced by this task (re-read requirements.md)
   - [ ] Technical approach matches design.md (if design says "use X", implementation must use X — not a stub/mock/alternative)
   - [ ] Tests run and pass, asserting the behavior described in requirements
   - If any check fails: fix the implementation and re-verify
   - If spec itself conflicts with reality (API doesn't exist, platform limitation, etc.): leave task as `- [ ]`, append `_Blocked: <reason>_` to the task line, and move to next task
5. **Complete task**: `bash scripts/complete-task.sh {{KIRO_DIR}}/specs/{{FEATURE_NAME}}/tasks.md <TASK_LINE> {{FEATURE_NAME}} "<task description>"`
   - This script stages only the files changed since this task started (delta-based) plus tasks.md, then commits
   - Never uses `git add -A` — only task-scoped changes are committed
6. **Record learnings**: If this task revealed cross-cutting insights (platform constraints, API behaviors, pattern discoveries), append a one-line note to the `## Implementation Notes` section at the bottom of tasks.md
7. **Loop back to step 1**: Continue with the next unchecked task

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
- Do NOT report ALL_TASKS_COMPLETE unless ALL tasks in tasks.md are `[x]`
- Feature Flag Protocol: behavioral tasks must prove RED with flag OFF before implementing GREEN
- If stuck on a task for multiple attempts, leave a TODO comment and move to next task
- Do NOT mark a task complete if the implementation deviates from design.md or does not satisfy requirements.md
- If spec conflicts with reality, block the task with `_Blocked:_` — do not silently work around it
- Keep `## Implementation Notes` concise: one line per insight, only cross-cutting learnings
