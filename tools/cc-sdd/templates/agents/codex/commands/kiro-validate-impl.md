<meta>
description: Validate implementation against requirements, design, and tasks
argument-hint: [feature-name] [task-numbers]
arguments:
   feature-name: $1
   task-numbers: $2
</meta>

# Implementation Validation

<background_information>
- **Mission**: Verify that implementation aligns with approved requirements, design, and tasks
- **Success Criteria**:
  - All specified tasks marked as completed
  - Tests exist and pass for implemented functionality
  - Requirements traceability confirmed (EARS requirements covered)
  - Design structure reflected in implementation
  - No regressions in existing functionality
</background_information>

<instructions>
## Core Task
Validate implementation for feature(s) and task(s) based on approved specifications.

## Task Hierarchy and Completion

- A major task with sub-tasks is a container, not a separate execution unit. Identify children by their numbered prefix (`1.1`, `1.2` belong to `1.`), regardless of indentation or `(P)` markers.
- A major task without sub-tasks is an executable task. Apply the same implementation, review, verification, and checkbox rules as for an executable sub-task; this also applies in mixed task lists.
- A container is complete if and only if all of its sub-tasks are `[x]`, including optional `*` sub-tasks, and none are blocked. If any child is unchecked or blocked, the container is incomplete. Do not infer child completion from a checked parent.
- Evaluate container completion from its children before checking task completion or dependencies. A stale parent checkbox alone must not cause NO-GO when all children are complete; report the bookkeeping mismatch. A checked parent cannot hide an unchecked or blocked child.
- Do not modify tasks.md during validation. Report stale parent checkboxes for the implementation command to synchronize. Standalone major tasks and selected executable sub-tasks must themselves be `[x]`.
- Selecting a container for validation expands to all of its executable sub-tasks. For explicit sub-task validation, unchecked siblings outside the selected scope do not fail that sub-task or mark its parent complete. For feature-level GO, every executable task must be complete and all existing test, coverage, design, integration, and blocked-task gates must pass. Count executable tasks only in task coverage.

## Execution Steps

### 1. Detect Validation Target

**If no arguments provided** (`$1` empty):
- Parse conversation history for `/prompts:kiro-spec-impl <feature> [tasks]` commands
- Extract feature names and task numbers from each execution
- Aggregate all implemented tasks by feature
- Report detected implementations (e.g., "user-auth: 1.1, 1.2, 1.3")
- If no history found, scan `{{KIRO_DIR}}/specs/` for features with completed tasks `[x]`

**If feature provided** (`$1` present, `$2` empty):
- Use specified feature
- Detect all completed tasks `[x]` in `{{KIRO_DIR}}/specs/$1/tasks.md`

**If both feature and tasks provided** (`$1` and `$2` present):
- Validate specified feature and tasks only (e.g., `user-auth 1.1,1.2`)

### 2. Load Context

For each detected feature:
- Read `{{KIRO_DIR}}/specs/<feature>/spec.json` for metadata
- Read `{{KIRO_DIR}}/specs/<feature>/requirements.md` for requirements
- Read `{{KIRO_DIR}}/specs/<feature>/design.md` for design structure
- Read `{{KIRO_DIR}}/specs/<feature>/tasks.md` for task list
- **Load ALL steering context**: Read entire `{{KIRO_DIR}}/steering/` directory including:
  - Default files: `structure.md`, `tech.md`, `product.md`
  - All custom steering files (regardless of mode settings)

### 3. Execute Validation

For each task, verify:

#### Task Completion Check
- Executable task checkbox is `[x]` in tasks.md; evaluate containers from their children as specified above
- If not completed, flag as "Task not marked complete"

#### Test Coverage Check
- Tests exist for task-related functionality
- Tests pass (no failures or errors)
- Use Bash to run test commands (e.g., `npm test`, `pytest`)
- If tests fail or don't exist, flag as "Test coverage issue"

#### Requirements Traceability
- Identify EARS requirements related to the task
- Use Grep to search implementation for evidence of requirement coverage
- If requirement not traceable to code, flag as "Requirement not implemented"

#### Design Alignment
- Check if design.md structure is reflected in implementation
- Verify key interfaces, components, and modules exist
- Use Grep/LS to confirm file structure matches design
- If misalignment found, flag as "Design deviation"

#### Regression Check
- Run full test suite (if available)
- Verify no existing tests are broken
- If regressions detected, flag as "Regression detected"

### 4. Generate Report

Provide summary in the language specified in spec.json:
- Validation summary by feature
- Coverage report (tasks, requirements, design)
- Issues and deviations with severity (Critical/Warning)
- GO/NO-GO decision

## Important Constraints
- **Conversation-aware**: Prioritize conversation history for auto-detection
- **Non-blocking warnings**: Design deviations are warnings unless critical
- **Test-first focus**: Test coverage is mandatory for GO decision
- **Traceability required**: All requirements must be traceable to implementation
</instructions>

## Tool Guidance
- **Conversation parsing**: Extract `/prompts:kiro-spec-impl` patterns from history
- **Read context**: Load all specs and steering before validation
- **Bash for tests**: Execute test commands to verify pass status
- **Grep for traceability**: Search codebase for requirement evidence
- **LS/Glob for structure**: Verify file structure matches design

## Output Description

Provide output in the language specified in spec.json with:

1. **Detected Target**: Features and tasks being validated (if auto-detected)
2. **Validation Summary**: Brief overview per feature (pass/fail counts)
3. **Issues**: List of validation failures with severity and location
4. **Coverage Report**: Requirements/design/task coverage percentages
5. **Decision**: GO (ready for next phase) / NO-GO (needs fixes)

**Format Requirements**:
- Use Markdown headings and tables for clarity
- Flag critical issues with ⚠️ or 🔴
- Keep summary concise (under 400 words)

## Safety & Fallback

### Error Scenarios
- **No Implementation Found**: If no `/prompts:kiro-spec-impl` in history and no `[x]` tasks, report "No implementations detected"
- **Test Command Unknown**: If test framework unclear, warn and skip test validation (manual verification required)
- **Missing Spec Files**: If spec.json/requirements.md/design.md missing, stop with error
- **Language Undefined**: Default to English (`en`) if spec.json doesn't specify language

### Next Steps Guidance

**If GO Decision**:
- Implementation validated and ready
- Proceed to deployment or next feature

**If NO-GO Decision**:
- Address critical issues listed
- Re-run `/prompts:kiro-spec-impl <feature> [tasks]` for fixes
- Re-validate with `/prompts:kiro-validate-impl [feature] [tasks]`

**Note**: Validation is recommended after implementation to ensure spec alignment and quality.
