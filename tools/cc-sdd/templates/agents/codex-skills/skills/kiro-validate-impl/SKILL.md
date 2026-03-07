---
name: kiro-validate-impl
description: Validate implementation against requirements, design, and tasks
---


# Implementation Validation

<background_information>
- **Mission**: Verify that implementation aligns with approved requirements, design, and tasks
- **Success Criteria**:
  - All specified tasks marked as completed
  - Tests exist and pass for implemented functionality
  - Requirements traceability confirmed (EARS requirements covered)
  - Design structure reflected in implementation
  - Real implementation present for required behavior (not only mocks/stubs/placeholders)
  - No regressions in existing functionality
</background_information>

<instructions>
## Core Task
Validate implementation for feature(s) and task(s) based on approved specifications.

## Execution Steps

### 1. Detect Validation Target

**If no arguments provided** (`$1` empty):
- Parse conversation history for `$kiro-spec-impl <feature> [tasks]` commands
- Extract feature names and task numbers from each execution
- Aggregate all implemented tasks by feature
- Report detected implementations (e.g., "user-auth: 1.1, 1.2, 1.3")
- If no history found, scan `{{KIRO_DIR}}/specs/` for features with completed tasks `[x]`

**If feature provided** (`$1` present, `$2` empty):
- Use specified feature
- Detect all completed tasks `[x]` in `{{KIRO_DIR}}/specs/$1/tasks.md`

**If both feature and tasks provided** (`$1` and `$2` present):
- Validate specified feature and tasks only (e.g., `user-auth 1.1,1.2`)

#### Parallel Research

The following validation checks are independent and can be executed in parallel:
1. **Test execution & coverage**: Run test suite, check for test existence per task, verify no regressions
2. **Requirements traceability**: Map requirement IDs to implementation code locations
3. **Design alignment**: Verify components, interfaces, and file structure match design.md
4. **Implementation integrity**: Verify claimed behavior is backed by real runtime code, not mocks/stubs/placeholders/TODO-only paths

If multi-agent is enabled, spawn sub-agents for each check above. Otherwise execute sequentially.

After all parallel checks complete, synthesize findings for GO/NO-GO assessment.

### 2. Load Context

For each detected feature:
- Read `{{KIRO_DIR}}/specs/<feature>/spec.json` for metadata
- Read `{{KIRO_DIR}}/specs/<feature>/requirements.md` for requirements
- Read `{{KIRO_DIR}}/specs/<feature>/design.md` for design structure
- Read `{{KIRO_DIR}}/specs/<feature>/tasks.md` for task list
- Core steering context: `product.md`, `tech.md`, `structure.md`
- Additional steering files only when directly relevant to the validated boundaries, runtime prerequisites, integrations, domain rules, security/performance constraints, or team conventions that affect the GO/NO-GO call
- Relevant local agent skills or playbooks only when they clearly match the feature's host environment or use case and provide validation-relevant constraints or procedures

### 3. Execute Validation

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
- Use Grep/LS to confirm file structure matches design
- If misalignment found, flag as "Design deviation"

#### Implementation Integrity
- Verify the task is implemented with concrete runtime code, not just mocks, stubs, placeholders, fake adapters, or TODO-only branches unless the spec explicitly allows them
- Confirm the codebase contains the real files, functions, handlers, components, routes, or services needed for the claimed behavior
- If the implementation only simulates success or scaffolds the path without real behavior, flag as "Placeholder implementation"

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
- **Source numbering only**: Use the exact section numbers from `requirements.md` and `design.md`; do not invent `REQ-*` aliases
- **Context Discipline**: Start with core steering and expand only with validation-relevant steering or use-case-aligned local agent skills/playbooks
</instructions>

## Tool Guidance
- **Conversation parsing**: Extract `$kiro-spec-impl` patterns from history
- **Read context**: Load specs, core steering, and only the local playbooks/agent skills relevant to the validation target
- **Bash for tests**: Execute test commands to verify pass status
- **Grep for traceability**: Search codebase for requirement evidence
- **LS/Glob for structure**: Verify file structure matches design

## Output Description

Provide output in the language specified in spec.json with:

1. **Detected Target**: Features and tasks being validated (if auto-detected)
2. **Validation Summary**: Brief overview per feature (pass/fail counts)
3. **Issues**: List of validation failures with severity and location
4. **Coverage Report**: Requirements/design/task coverage percentages using the source section numbers from the spec
5. **Decision**: GO (ready for next phase) / NO-GO (needs fixes)

**Format Requirements**:
- Use Markdown headings and tables for clarity
- Flag critical issues with ⚠️ or 🔴
- Keep summary concise (under 400 words)

## Safety & Fallback

### Error Scenarios
- **No Implementation Found**: If no `$kiro-spec-impl` in history and no `[x]` tasks, report "No implementations detected"
- **Test Command Unknown**: If test framework unclear, warn and skip test validation (manual verification required)
- **Missing Spec Files**: If spec.json/requirements.md/design.md missing, stop with error
- **Language Undefined**: Default to English (`en`) if spec.json doesn't specify language

### Next Steps Guidance

**If GO Decision**:
- Implementation validated and ready
- Proceed to deployment or next feature

**If NO-GO Decision**:
- Address critical issues listed
- Re-run `$kiro-spec-impl <feature> [tasks]` for fixes
- Re-validate with `$kiro-validate-impl [feature] [tasks]`

**Note**: Validation is recommended after implementation to ensure spec alignment and quality.
