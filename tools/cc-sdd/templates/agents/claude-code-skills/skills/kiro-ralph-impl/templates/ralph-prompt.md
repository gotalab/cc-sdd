# SDD Implementation: {{FEATURE_NAME}}

## Context Loading

Read the following files to understand the full implementation context:
1. `{{KIRO_DIR}}/specs/{{FEATURE_NAME}}/tasks.md` — task list and progress
2. `{{KIRO_DIR}}/specs/{{FEATURE_NAME}}/design.md` — architecture and component design
3. `{{KIRO_DIR}}/specs/{{FEATURE_NAME}}/requirements.md` — functional requirements
4. Entire `{{KIRO_DIR}}/steering/` directory — project conventions and patterns

## Parent Responsibilities

Before delegating any implementation work, the parent Ralph Loop agent must:
- Keep environment/setup work in the parent: plugin checks, repo readiness, and validation command discovery
- Establish a repo baseline with `git status --porcelain`
- Discover the canonical validation commands from repo files such as `package.json`, `pyproject.toml`, `go.mod`, `Makefile`, and `README*`
- Retain control of `tasks.md` updates and commits
- Retain control of the final validation gate and any remediation decisions

## Orchestration Protocol

1. **Read tasks.md** and identify the next actionable sub-task:
   - Only sub-tasks (X.Y numbering like 1.1, 2.3) — major tasks (1., 2.) are grouping headers, skip them
   - Skip tasks with `_Blocked:_` annotation
2. **If no actionable tasks remain**:
   - If all required sub-tasks (`- [ ]` with X.Y numbering) are gone → proceed to step 8 for final validation (do NOT output the completion promise yet)
   - If remaining required sub-tasks all have `_Blocked:_` → report blocked tasks and reasons, then stop (human review needed)
3. **Check prerequisites**: Verify `_Depends:_` annotations — referenced tasks must be `[x]`
4. **Delegate implementation** to a subagent (`tdd-task-implementer`):
   - Pass: task description, boundary scope, exact requirement/design section numbers as written in `requirements.md` and `design.md`, steering context, and the validation commands discovered by the parent
   - For behavioral tasks: subagent follows the Feature Flag Protocol (flag OFF → RED → flag ON → GREEN → remove flag)
   - For non-behavioral tasks (refactoring, config): standard TDD cycle
   - Subagent does NOT update `tasks.md` or create commits; it returns changed files, exact section coverage, review results, and validation results to the parent after running its own review/fix loop
5. **Verify against spec** — do NOT proceed to step 6 unless ALL pass:
   - [ ] Worker report cites the exact section numbers from `requirements.md` and `design.md` (for example `1.2`, `3.1`, `A.2`) and does not invent `REQ-*` aliases
   - [ ] Implementation satisfies the requirement referenced by this task (re-read requirements.md)
   - [ ] Technical approach matches design.md (if design says "use X", implementation must use X — not a stub/mock/alternative)
   - [ ] Implementation is real production behavior, not a mock/stub/placeholder/fake/TODO-only path unless the task explicitly requires it
   - [ ] Tests run and pass, asserting the behavior described in requirements
   - If any check fails: revert `[x]` to `[ ]` and re-delegate
   - If spec itself conflicts with reality (API doesn't exist, platform limitation, etc.): revert `[x]` to `[ ]`, append `_Blocked: <reason>_` to the task line, and move to next task
6. **Mark complete and commit** — parent-only, selective staging:
   - After verification passes, the parent agent marks the task `[x]` in `tasks.md`
   - Stage only the files you actually changed for this task, plus tasks.md
   - **NEVER** use `git add -A` or `git add .` — these capture unrelated changes and pollute the commit
   - Use `git add <file1> <file2> ...` with explicit file paths
   - Commit message format: `feat(<feature-name>): <task description>`
7. **Record learnings**: If this task revealed cross-cutting insights (platform constraints, API behaviors, pattern discoveries), append a one-line note to the `## Implementation Notes` section at the bottom of tasks.md
8. **Final validation and remediation**:
   - Load and execute the packaged `kiro-validate-impl` workflow from `.claude/skills/kiro-validate-impl/SKILL.md` for `{{FEATURE_NAME}}`
   - Treat this as a feature-level GO/NO-GO gate, not just a re-check of the last task
   - If validation returns GO → output `<promise>ALL_TASKS_COMPLETE</promise>` and stop
   - If validation returns NO-GO:
     - Fix only the concrete findings from the validation report
     - If a finding maps cleanly to one or more completed tasks, revert those task checkboxes to `[ ]` and return to step 1
     - If a finding is cross-cutting but fixable without reopening tasks, make a focused remediation change, validate locally, commit with `fix(<feature-name>): address final validation findings`, then re-run this step
     - Cap final-validation remediation at 3 rounds; if still NO-GO, stop without the completion promise and report the remaining findings

## Subagent Delegation

For each task, delegate to a `tdd-task-implementer` subagent with this context:
- Full spec context (design.md, requirements.md, tasks.md, steering)
- The specific task to implement
- The exact requirement and design section numbers that the task must satisfy, using the source numbering from those files
- `_Boundary:_` scope constraints
- Existing code patterns from the codebase
- Validation commands discovered by the parent agent

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
- ONE sub-task (e.g., 1.1, 1.2) per iteration — major tasks (1, 2) are grouping headers, not execution units
- When multiple `(P)` sub-tasks have all dependencies met, they may run in parallel via sub-agents
- TDD is mandatory: tests before implementation
- Respect `_Boundary:_` annotations
- Verify `_Depends:_` prerequisites before starting
- Do NOT output `<promise>ALL_TASKS_COMPLETE</promise>` unless ALL required sub-tasks in tasks.md are `[x]`
- `max_iterations` defaults to 100 and acts only as a simple safety fuse
- Parent agent owns setup/preflight, `tasks.md`, and commits; subagent owns implementation only
- Subagent review must cite exact spec section numbers and concrete code/test evidence before the parent accepts completion
- Final validation must pass before the completion promise is emitted
- Final-validation remediation is capped at 3 rounds and stays in the parent agent
- Feature Flag Protocol: behavioral tasks must prove RED with flag OFF before implementing GREEN
- If stuck on a task for multiple attempts, leave a TODO comment and move to next task
- Do NOT mark a task complete if the implementation deviates from design.md or does not satisfy requirements.md
- If spec conflicts with reality, block the task with `_Blocked:_` — do not silently work around it
- Keep `## Implementation Notes` concise: one line per insight, only cross-cutting learnings
