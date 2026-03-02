---
name: kiro-spec-impl
description: Execute implementation tasks using Test-Driven Development methodology. Use when implementing approved tasks.
allowed-tools: Read, Write, Edit, MultiEdit, Bash, Glob, Grep, WebSearch, WebFetch
argument-hint: <feature-name> [task-numbers]
---

# kiro-spec-impl Skill

## Role
You are a specialized skill for executing implementation tasks using Test-Driven Development methodology based on approved specifications.

## Core Mission
- **Mission**: Execute implementation tasks using Test-Driven Development methodology based on approved specifications
- **Success Criteria**:
  - All tests written before implementation code
  - Code passes all tests with no regressions
  - Tasks marked as completed in tasks.md
  - Implementation aligns with design and requirements

## Execution Steps

### Step 1: Gather Context

If steering/spec context is already available from conversation, skip redundant file reads.
Otherwise, load all necessary context:
- `{{KIRO_DIR}}/specs/{feature}/spec.json`, `requirements.md`, `design.md`, `tasks.md`
- **Entire `{{KIRO_DIR}}/steering/` directory** for complete project memory

#### Parallel Research

The following research areas are independent and can be executed in parallel:
1. **Spec context loading**: spec.json, requirements.md, design.md, tasks.md
2. **Steering & patterns**: Steering files, coding conventions, existing code patterns

After all parallel research completes, synthesize implementation brief before starting TDD.

**Validate approvals**:
- Verify tasks are approved in spec.json (stop if not, see Safety & Fallback)

### Step 2: Select Tasks

**Determine which tasks to execute**:
- If task numbers provided: Execute specified task numbers (e.g., "1.1" or "1,2,3")
- Otherwise: Execute all pending tasks (unchecked `- [ ]` in tasks.md)

**Check prerequisites**:
- For each selected task, check `_Depends:_` annotations — verify referenced tasks are marked `[x]`
- If prerequisites incomplete, execute them first or warn the user
- Use `_Boundary:_` annotations to understand the task's component scope

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
   - Update checkbox from `- [ ]` to `- [x]` in tasks.md

## Critical Constraints
- **TDD Mandatory**: Tests MUST be written before implementation code
- **Task Scope**: Implement only what the specific task requires
- **Test Coverage**: All new code must have tests
- **No Regressions**: Existing tests must continue to pass
- **Design Alignment**: Implementation must follow design.md specifications
- **Boundary Scope**: Respect `_Boundary:_` annotations — limit changes to declared components
- **Dependency Check**: Verify `_Depends:_` prerequisites are complete before starting a task

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
- **Suggested Action**: "Complete previous phases: `/kiro-spec-requirements`, `/kiro-spec-design`, `/kiro-spec-tasks`"

**Test Failures**:
- **Stop Implementation**: Fix failing tests before continuing
- **Action**: Debug and fix, then re-run

### Next Phase: Validation

**After Implementation Complete**:
- Run `/kiro-validate-impl {feature}` to verify implementation quality
- Validates test coverage, requirements traceability, and design alignment
