# SDD Implementation: {{FEATURE_NAME}}

## Context Loading

Read the following files to understand the full implementation context:
1. `{{KIRO_DIR}}/specs/{{FEATURE_NAME}}/tasks.md` — task list and progress
2. `{{KIRO_DIR}}/specs/{{FEATURE_NAME}}/design.md` — architecture and component design
3. `{{KIRO_DIR}}/specs/{{FEATURE_NAME}}/requirements.md` — functional requirements
4. Entire `{{KIRO_DIR}}/steering/` directory — project conventions and patterns

## Orchestration Protocol

**Initialize**: `bash scripts/setup-loop.sh {{KIRO_DIR}}/specs/{{FEATURE_NAME}}/tasks.md`

**Loop** — repeat until check-loop returns ALL_COMPLETE:

1. **Check loop status**: `bash scripts/check-loop.sh {{KIRO_DIR}}/specs/{{FEATURE_NAME}}/tasks.md .ralph-loop-state.md`
   - If `STATUS: ALL_COMPLETE` → report ALL_TASKS_COMPLETE and stop the loop
   - If `STATUS: MAX_ITERATIONS_REACHED` → report iteration limit and stop
2. **Get next task**: `bash scripts/next-task.sh {{KIRO_DIR}}/specs/{{FEATURE_NAME}}/tasks.md`
   - If `DEPS_STATUS: BLOCKED` → skip to next unchecked task
3. **Execute TDD implementation** directly:
   - Use: task description, boundary scope, relevant design.md sections, steering context
   - For behavioral tasks: follow the Feature Flag Protocol (flag OFF → RED → flag ON → GREEN → remove flag)
   - For non-behavioral tasks (refactoring, config): standard TDD cycle
4. **Complete task**: `bash scripts/complete-task.sh {{KIRO_DIR}}/specs/{{FEATURE_NAME}}/tasks.md <TASK_LINE> {{FEATURE_NAME}} "<task description>"`
5. **Loop back to step 1**: Continue with the next unchecked task

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
- ONE task per loop cycle (keep cycles focused)
- TDD is mandatory: tests before implementation
- Respect `_Boundary:_` annotations
- Verify `_Depends:_` prerequisites before starting
- Do NOT report ALL_TASKS_COMPLETE unless ALL tasks in tasks.md are `[x]`
- Feature Flag Protocol: behavioral tasks must prove RED with flag OFF before implementing GREEN
- If stuck on a task for multiple attempts, leave a TODO comment and move to next task
