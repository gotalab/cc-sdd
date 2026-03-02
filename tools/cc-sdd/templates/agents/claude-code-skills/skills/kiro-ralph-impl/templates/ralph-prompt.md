# SDD Implementation: {{FEATURE_NAME}}

## Context Loading

Read the following files to understand the full implementation context:
1. `{{KIRO_DIR}}/specs/{{FEATURE_NAME}}/tasks.md` — task list and progress
2. `{{KIRO_DIR}}/specs/{{FEATURE_NAME}}/design.md` — architecture and component design
3. `{{KIRO_DIR}}/specs/{{FEATURE_NAME}}/requirements.md` — functional requirements
4. Entire `{{KIRO_DIR}}/steering/` directory — project conventions and patterns

## Orchestration Protocol

1. **Read tasks.md** and identify the next unchecked task (`- [ ]`)
2. **If no unchecked tasks remain**: Output `<promise>ALL_TASKS_COMPLETE</promise>` and stop
3. **Check prerequisites**: Verify `_Depends:_` annotations — referenced tasks must be `[x]`
4. **Delegate implementation** to a subagent (kent-beck-tdd-developer):
   - Pass: task description, boundary scope, relevant design.md sections, steering context
   - For behavioral tasks: subagent follows the Feature Flag Protocol (flag OFF → RED → flag ON → GREEN → remove flag)
   - For non-behavioral tasks (refactoring, config): standard TDD cycle
   - Subagent marks the task `[x]` in tasks.md when complete
5. **Verify**: Confirm the task is now `[x]` and tests pass
6. **Commit**: Create a git commit for the completed task

## Subagent Delegation

For each task, delegate to a kent-beck-tdd-developer subagent with this context:
- Full spec context (design.md, requirements.md, tasks.md, steering)
- The specific task to implement
- `_Boundary:_` scope constraints
- Existing code patterns from the codebase

## Feature Flag Protocol

For tasks that add or change behavior, enforce RED → GREEN with a feature flag:

1. **Add flag** (OFF by default): Introduce a toggle appropriate to the codebase
   (env var, config constant, boolean, conditional — agent chooses the mechanism)
2. **RED — flag OFF**: Write tests for the new behavior. Run tests → must FAIL.
   If tests pass with flag OFF, the tests are not testing the right thing. Rewrite.
3. **GREEN — flag ON + implement**: Enable the flag, write implementation. Run tests → must PASS.
4. **Remove flag**: Make the code unconditional. Run tests → must still PASS.

**Skip this protocol for**: refactoring, configuration, documentation, or tasks with no behavioral change.

## Critical Rules
- ONE task per iteration (keep iterations focused)
- TDD is mandatory: tests before implementation
- Respect `_Boundary:_` annotations
- Verify `_Depends:_` prerequisites before starting
- Do NOT output `<promise>ALL_TASKS_COMPLETE</promise>` unless ALL tasks in tasks.md are `[x]`
- Feature Flag Protocol: behavioral tasks must prove RED with flag OFF before implementing GREEN
- If stuck on a task for multiple attempts, leave a TODO comment and move to next task
