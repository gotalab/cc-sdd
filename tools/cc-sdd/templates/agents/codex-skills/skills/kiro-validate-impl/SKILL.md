---
name: kiro-validate-impl
description: Validate feature-level integration after all tasks are implemented. Checks cross-task consistency, full test suite, and overall spec coverage.
---


# Implementation Integration Validation

<background_information>
- **Mission**: Verify that the completed feature works as a whole — not just that each task passes individually
- **Success Criteria**:
  - All tasks marked `[x]` in tasks.md
  - Full test suite passes (not just per-task tests)
  - Cross-task integration works (data flows between components, interfaces match)
  - Requirements coverage is complete across all tasks (no gaps between tasks)
  - Design structure is reflected end-to-end (not just per-component)
  - No orphaned code, conflicting implementations, or integration seams

**What This Skill Does NOT Do**: Per-task checks are the reviewer's responsibility during `$kiro-impl`. This skill does NOT re-check individual task acceptance criteria, per-file reality checks, or single-task spec alignment.
</background_information>

<instructions>
## Core Task
Validate feature-level integration for feature(s) and task(s) based on approved specifications.

## Execution Steps

### 1. Detect Validation Target

**If no arguments provided** (`$1` empty):
- Parse conversation history for `$kiro-impl <feature> [tasks]` commands
- Extract feature names and task numbers from each execution
- Aggregate all implemented tasks by feature
- Report detected implementations (e.g., "user-auth: 1.1, 1.2, 1.3")
- If no history found, scan `{{KIRO_DIR}}/specs/` for features with completed tasks `[x]`

**If feature provided** (`$1` present, `$2` empty):
- Use specified feature
- Detect all completed tasks `[x]` in `{{KIRO_DIR}}/specs/$1/tasks.md`

**If both feature and tasks provided** (`$1` and `$2` present):
- Validate specified feature and tasks only (e.g., `user-auth 1.1,1.2`)

#### Sub-agent Dispatch (parallel)

The following validation dimensions are independent and can be dispatched as **sub-agents**. The agent should decide the optimal decomposition based on feature scope — split, merge, or skip sub-agents as appropriate. Each sub-agent returns a **structured findings summary** to keep the main context clean for GO/NO-GO synthesis.

**Typical validation dimensions** (adjust as appropriate):
- **Test execution**: Run the complete test suite, report pass/fail with details
- **Requirements coverage**: Build requirements → implementation matrix, report gaps
- **Design alignment**: Verify architecture matches design.md, report drift and dependency violations
- **Cross-task integration**: Verify data flows, API contracts, shared state consistency

If multi-agent is not available, run checks sequentially in main context.

After all checks complete, synthesize findings for GO/NO-GO/MANUAL_VERIFY_REQUIRED assessment.

### 2. Load Context

For each detected feature:
- Read `{{KIRO_DIR}}/specs/<feature>/spec.json` for metadata
- Read `{{KIRO_DIR}}/specs/<feature>/requirements.md` for requirements
- Read `{{KIRO_DIR}}/specs/<feature>/design.md` for design structure
- Read `{{KIRO_DIR}}/specs/<feature>/tasks.md` for task list and Implementation Notes
- Core steering context: `product.md`, `tech.md`, `structure.md`
- Additional steering files only when directly relevant to the validated boundaries, runtime prerequisites, integrations, domain rules, security/performance constraints, or team conventions that affect the GO/NO-GO call

### 3. Execute Integration Validation

#### Mechanical Checks (run commands, use results)

**A. Full Test Suite**
- Run full test suite (e.g., `npm test`, `pytest`, `go test ./...`). Use the exit code.
- If tests fail → NO-GO. No judgment needed.
- If the canonical test command cannot be identified → `MANUAL_VERIFY_REQUIRED`

**B. Residual TBD/TODO/FIXME**
- Run: `grep -rn "TBD\|TODO\|FIXME\|HACK\|XXX" <files-in-feature-boundary>`
- If matches found that were introduced by this feature → flag as Warning

**C. Residual Hardcoded Secrets**
- Run: `grep -rn "password\s*=\|api_key\s*=\|secret\s*=\|token\s*=" <files-in-feature-boundary>` (case-insensitive)
- If matches found that aren't environment variable references → flag as Critical

#### Judgment Checks (read code, compare to spec)

**D. Cross-Task Integration**
- Identify where tasks share interfaces, data models, or API contracts
- Verify that Task A's output format matches Task B's expected input
- Check for conflicting assumptions between tasks (naming conventions, error codes, data shapes)
- Verify shared state (database schemas, config, environment) is consistent across tasks

**E. Requirements Coverage Gaps**
- Map every requirement section to at least one completed task
- Identify requirements that no single task fully covers (cross-cutting requirements)
- Identify requirements partially covered by multiple tasks but not fully by any
- Use the original section numbering from `requirements.md`; do NOT invent `REQ-*` aliases

**F. Design End-to-End Alignment**
- Verify the overall component graph matches design.md
- Check that integration patterns (event flow, API boundaries, dependency injection) work as designed
- Verify dependency direction follows design.md's architecture (no upward imports)
- Verify File Structure Plan matches the actual file layout
- Identify any architectural drift from the original design
- Use the original section numbering from `design.md`

**G. Blocked Tasks & Implementation Notes**
- Check for any tasks still marked `_Blocked:_` — report why and assess impact on feature completeness
- Review `## Implementation Notes` in tasks.md for cross-cutting insights that need attention

### 4. Generate Report

Provide summary in the language specified in spec.json:

```
## Validation Report
- DECISION: GO | NO-GO | MANUAL_VERIFY_REQUIRED
- MECHANICAL_RESULTS:
  - Tests: PASS | FAIL (command and exit code)
  - TBD/TODO grep: CLEAN | <count> matches
  - Secrets grep: CLEAN | <count> matches
- INTEGRATION:
  - Cross-task contracts: <status>
  - Shared state consistency: <status>
- COVERAGE:
  - Requirements mapped: <X/Y sections covered>
  - Coverage gaps: <list of uncovered requirement sections>
- DESIGN:
  - Architecture drift: <findings>
  - Dependency direction: <violations if any>
  - File Structure Plan vs actual: <match/mismatch>
- BLOCKED_TASKS: <list and impact assessment>
- REMEDIATION: <if NO-GO: specific, actionable steps to fix each issue>
```

If NO-GO, REMEDIATION is mandatory — identify the exact issue and what needs to change.

## Important Constraints
- **Integration focus**: This is a feature-level gate, not a per-task re-check
- **Mechanical first**: Run commands and use results before applying judgment
- **Conversation-aware**: Prioritize conversation history for auto-detection
- **Test-first focus**: Full test suite pass is mandatory for GO decision
- **Source numbering only**: Use the exact section numbers from `requirements.md` and `design.md`; do not invent `REQ-*` aliases
- **Context Discipline**: Start with core steering and expand only with validation-relevant steering
- **Strict Final Gate**: Return `GO` only when all integration checks passed; return `NO-GO` for concrete failures and `MANUAL_VERIFY_REQUIRED` when mandatory validation could not be completed
- **Remediation required**: NO-GO must include actionable remediation steps
</instructions>

## Tool Guidance
- **Conversation parsing**: Extract `$kiro-impl` patterns from history
- **Read context**: Load specs, steering, and Implementation Notes from tasks.md
- **Bash for tests**: Execute full test suite
- **Grep for traceability**: Search codebase for requirement coverage across task boundaries
- **LS/Glob for structure**: Verify overall file structure matches design

## Output Description

Provide output in the language specified in spec.json with:

1. **Detected Target**: Features and tasks being validated (if auto-detected)
2. **Mechanical Results**: Test suite, TBD/TODO, secrets grep results
3. **Integration Summary**: Brief overview of cross-task integration status
4. **Issues**: Integration failures with severity and location
5. **Coverage Map**: Requirements/design coverage using source section numbers
6. **Decision**: GO / NO-GO / MANUAL_VERIFY_REQUIRED
7. **Remediation** (if NO-GO): Specific files and actions needed

**Format**: Markdown headings and tables. Keep summary concise (under 400 words).

## Safety & Fallback

### Error Scenarios
- **No Implementation Found**: If no `$kiro-impl` in history and no `[x]` tasks, report "No implementations detected"
- **Test Command Unknown**: Return `MANUAL_VERIFY_REQUIRED` and explain which validation command is missing; do not return `GO`
- **Missing Spec Files**: Stop with error if spec.json/requirements.md/design.md missing

### Next Steps Guidance

**If GO Decision**:
- Feature validated end-to-end and ready for deployment or next feature

**If NO-GO Decision**:
- Address integration issues listed
- Re-run `$kiro-impl <feature> [tasks]` for targeted fixes
- Re-validate with `$kiro-validate-impl [feature]`

**Session Interrupted**:
- Safe to re-run — validation is read-only and idempotent

**If MANUAL_VERIFY_REQUIRED**:
- Do not treat the feature as complete
- Provide the exact missing validation step or environment prerequisite
