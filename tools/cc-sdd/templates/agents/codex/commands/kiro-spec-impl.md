<meta>
description: Execute spec tasks using TDD methodology
argument-hint: <feature-name> [task-numbers]
arguments:
   feature-name: $1
   task-numbers: $2
</meta>

# Implementation Task Executor

<background_information>
- **Mission**: Execute implementation tasks using Test-Driven Development methodology based on approved specifications
- **Success Criteria**:
  - All tests written before implementation code
  - Code passes all tests with no regressions
  - Tasks marked as completed in tasks.md
  - Implementation aligns with design and requirements
</background_information>

<instructions>
## Core Task
Execute implementation tasks for feature **$1** using Test-Driven Development.

## Task Hierarchy and Completion

- A major task with sub-tasks is a container, not a separate execution unit. Identify children by their numbered prefix (`1.1`, `1.2` belong to `1.`), regardless of indentation or `(P)` markers.
- A major task without sub-tasks is an executable task. Apply the same implementation, review, verification, and checkbox rules as for an executable sub-task; this also applies in mixed task lists.
- A container is complete if and only if all of its sub-tasks are `[x]`, including optional `*` sub-tasks, and none are blocked. If any child is unchecked or blocked, the container is incomplete. Do not infer child completion from a checked parent.
- Selecting a container task number expands to its executable sub-tasks; selecting a standalone major task executes that task. For all-pending mode, queue unchecked executable tasks only, not container rows. Preserve dependency and blocked-task checks.
- After each task checkbox update, re-read tasks.md and synchronize its parent: set the container to `[x]` only when all children are complete; otherwise set it to `[ ]`. Reconcile stale container checkboxes before queue selection and before final validation, including when there are no pending executable tasks. Do not change executable checkboxes without the required implementation/review/verification evidence.
- Count executable tasks only when reporting progress; do not count containers twice. In autonomous mode, the parent controller owns checkbox synchronization and includes it in the task commit.

## Execution Steps

### Step 1: Load Context

**Read all necessary context**:
- `{{KIRO_DIR}}/specs/$1/spec.json`, `requirements.md`, `design.md`, `tasks.md`
- **Entire `{{KIRO_DIR}}/steering/` directory** for complete project memory

**Validate approvals**:
- Verify tasks are approved in spec.json (stop if not, see Safety & Fallback)

### Step 2: Select Tasks

**Determine which tasks to execute**:
- If `$2` provided: Execute specified task numbers (e.g., "1.1" or "1,2,3")
- Otherwise: Execute all pending tasks (unchecked `- [ ]` in tasks.md)

### Step 3: Execute with TDD

For each selected task, follow Kent Beck's TDD cycle:

1. **RED - Write Failing Test**:
   - Write test for the next small piece of functionality
   - Test should fail (code doesn't exist yet)
   - Use descriptive test names

2. **GREEN - Write Minimal Code**:
   - Implement simplest solution to make test pass
   - Focus only on making THIS test pass
   - Avoid over-engineering

3. **REFACTOR - Clean Up**:
   - Improve code structure and readability
   - Remove duplication
   - Apply design patterns where appropriate
   - Ensure all tests still pass after refactoring

4. **VERIFY - Validate Quality**:
   - All tests pass (new and existing)
   - No regressions in existing functionality
   - Code coverage maintained or improved

5. **MARK COMPLETE**:
   - Update the executable task checkbox from `- [ ]` to `- [x]` in tasks.md, then synchronize its parent as specified above

## Critical Constraints
- **TDD Mandatory**: Tests MUST be written before implementation code
- **Task Scope**: Implement only what the specific task requires
- **Test Coverage**: All new code must have tests
- **No Regressions**: Existing tests must continue to pass
- **Design Alignment**: Implementation must follow design.md specifications
</instructions>

## Tool Guidance
- **Read first**: Load all context before implementation
- **Test first**: Write tests before code
- Use **WebSearch/WebFetch** for library documentation when needed

## Output Description

Provide brief summary in the language specified in spec.json:

1. **Tasks Executed**: Task numbers and test results
2. **Status**: Completed tasks marked in tasks.md, remaining tasks count

**Format**: Concise (under 150 words)

## Safety & Fallback

### Error Scenarios

**Tasks Not Approved or Missing Spec Files**:
- **Stop Execution**: All spec files must exist and tasks must be approved
- **Suggested Action**: "Complete previous phases: `/prompts:kiro-spec-requirements`, `/prompts:kiro-spec-design`, `/prompts:kiro-spec-tasks`"

**Test Failures**:
- **Stop Implementation**: Fix failing tests before continuing
- **Action**: Debug and fix, then re-run

### Task Execution

**Execute specific task(s)**:
- `/prompts:kiro-spec-impl $1 1.1` - Single task
- `/prompts:kiro-spec-impl $1 1,2,3` - Multiple tasks

**Execute all pending**:
- `/prompts:kiro-spec-impl $1` - All unchecked tasks

