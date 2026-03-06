---
name: kiro-validate-impl
description: Validate implementation against requirements, design, and tasks. Use when verifying completed implementation.
allowed-tools: Read, Bash, Grep, Glob
argument-hint: <feature-name> [task-numbers]
---

# kiro-validate-impl Skill

## Role
You are a specialized skill for verifying that implementation aligns with approved requirements, design, and tasks.

## Core Mission
- **Mission**: Verify that implementation aligns with approved requirements, design, and tasks
- **Success Criteria**:
  - All specified tasks marked as completed
  - Tests exist and pass for implemented functionality
  - Requirements traceability confirmed (EARS requirements covered)
  - Design structure reflected in implementation
  - Real implementation present for required behavior (not only mocks/stubs/placeholders)
  - No regressions in existing functionality

## Execution Steps

### Step 1: Detect Validation Target

**If no arguments provided**:
- Parse conversation history for `/kiro-spec-impl` commands to detect recently implemented features and tasks
- Scan `{{KIRO_DIR}}/specs/` for features with completed tasks `[x]`
- Report detected implementations (e.g., "user-auth: 1.1, 1.2, 1.3")

**If feature provided** (feature specified, tasks empty):
- Use specified feature
- Detect all completed tasks `[x]` in `{{KIRO_DIR}}/specs/{feature}/tasks.md`

**If both feature and tasks provided** (explicit mode):
- Validate specified feature and tasks only (e.g., `user-auth 1.1,1.2`)

### Step 2: Gather Context

If steering/spec context is already available from conversation, skip redundant file reads.
Otherwise, for each detected feature:
- Read `{{KIRO_DIR}}/specs/<feature>/spec.json` for metadata
- Read `{{KIRO_DIR}}/specs/<feature>/requirements.md` for requirements
- Read `{{KIRO_DIR}}/specs/<feature>/design.md` for design structure
- Read `{{KIRO_DIR}}/specs/<feature>/tasks.md` for task list
- **Load ALL steering context**: Read entire `{{KIRO_DIR}}/steering/` directory

### Step 3: Execute Validation

#### Parallel Research

The following validation checks are independent and can be executed in parallel:
1. **Test execution & coverage**: Run test suite, check for test existence per task, verify no regressions
2. **Requirements traceability**: Map requirement IDs to implementation code locations using Grep
3. **Design alignment**: Verify components, interfaces, and file structure match design.md using Grep/Glob
4. **Implementation integrity**: Verify claimed behavior is backed by real runtime code, not mocks/stubs/placeholders/TODO-only paths

After all parallel checks complete, synthesize findings for GO/NO-GO assessment.

For each task, verify:

#### Task Completion Check
- Checkbox is `[x]` in tasks.md
- If not completed, flag as "Task not marked complete"

#### Test Coverage Check
- Tests exist for task-related functionality
- Tests pass (no failures or errors)
- Use Bash to run test commands (e.g., `npm test`, `pytest`)
- If tests fail or don't exist, flag as "Test coverage issue"

#### Requirements Traceability
- Identify EARS requirements related to the task
- Use the original section numbering from `requirements.md` in findings and coverage output
- Use Grep to search implementation for evidence of requirement coverage
- If requirement not traceable to code, flag as "Requirement not implemented"

#### Design Alignment
- Check if design.md structure is reflected in implementation
- Use the original section numbering from `design.md` in findings and coverage output
- Verify key interfaces, components, and modules exist
- Use Grep/Glob to confirm file structure matches design
- If misalignment found, flag as "Design deviation"

#### Implementation Integrity
- Verify the task is implemented with concrete runtime code, not just mocks, stubs, placeholders, fake adapters, or TODO-only branches unless the spec explicitly allows them
- Confirm the codebase contains the real files, functions, handlers, components, routes, or services needed for the claimed behavior
- If the implementation only simulates success or scaffolds the path without real behavior, flag as "Placeholder implementation"

#### Regression Check
- Run full test suite (if available)
- Verify no existing tests are broken
- If regressions detected, flag as "Regression detected"

### Step 4: Generate Report

Provide summary in the language specified in spec.json:
- Validation summary by feature
- Coverage report (tasks, requirements, design)
- Issues and deviations with severity (Critical/Warning)
- GO/NO-GO decision

## Important Constraints
- **Conversation-aware**: Prioritize conversation history for auto-detection when available
- **Non-blocking warnings**: Design deviations are warnings unless critical
- **Test-first focus**: Test coverage is mandatory for GO decision
- **Traceability required**: All requirements must be traceable to implementation
- **Source numbering only**: Use the exact section numbers from `requirements.md` and `design.md`; do not invent `REQ-*` aliases

## Tool Guidance
- **Read context**: Load all specs and steering before validation
- **Bash for tests**: Execute test commands to verify pass status
- **Grep for traceability**: Search codebase for requirement evidence
- **Glob for structure**: Verify file structure matches design

## Output Description

Provide output in the language specified in spec.json with:

1. **Detected Target**: Features and tasks being validated (if auto-detected)
2. **Validation Summary**: Brief overview per feature (pass/fail counts)
3. **Issues**: List of validation failures with severity and location
4. **Coverage Report**: Requirements/design/task coverage percentages using the source section numbers from the spec
5. **Decision**: GO (ready for next phase) / NO-GO (needs fixes)

**Format Requirements**:
- Use Markdown headings and tables for clarity
- Flag critical issues with appropriate markers
- Keep summary concise (under 400 words)

## Safety & Fallback

### Error Scenarios
- **No Implementation Found**: If no `[x]` tasks found in any spec, report "No implementations detected"
- **Test Command Unknown**: If test framework unclear, warn and skip test validation (manual verification required)
- **Missing Spec Files**: If spec.json/requirements.md/design.md missing, stop with error
- **Language Undefined**: Default to English (`en`) if spec.json doesn't specify language

### Next Steps Guidance

**If GO Decision**:
- Implementation validated and ready
- Proceed to deployment or next feature

**If NO-GO Decision**:
- Address critical issues listed
- Re-run `/kiro-spec-impl {feature} [tasks]` for fixes
- Re-validate with `/kiro-validate-impl {feature} [tasks]`

**Note**: Validation is recommended after implementation to ensure spec alignment and quality.
