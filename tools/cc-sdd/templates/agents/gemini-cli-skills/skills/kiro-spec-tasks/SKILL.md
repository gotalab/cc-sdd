---
name: kiro-spec-tasks
description: Generate implementation tasks for a specification
metadata:
  shared-rules: "tasks-generation.md, tasks-parallel-analysis.md"
---


# Implementation Tasks Generator

<background_information>
- **Success Criteria**:
  - All requirements mapped to specific tasks
  - Tasks properly sized (1-3 hours each)
  - Clear task progression with proper hierarchy
  - Natural language descriptions focused on capabilities
</background_information>

<instructions>
## Execution Steps

### Step 1: Load Context

**Read all necessary context**:
- `{{KIRO_DIR}}/specs/$1/spec.json`, `requirements.md`, `design.md`
- `{{KIRO_DIR}}/specs/$1/tasks.md` (if exists, for merge mode)
- Core steering context: `product.md`, `tech.md`, `structure.md`
- Additional steering files only when directly relevant to requirements coverage, design boundaries, runtime prerequisites, or team conventions that affect task executability

**Validate approvals**:
- If `-y` flag provided: Auto-approve requirements and design in spec.json. Tasks approval is also handled automatically in Step 4.
- Otherwise: Verify both approved (stop if not, see Safety & Fallback)
- Determine sequential mode based on presence of `--sequential`

### Step 2: Generate Implementation Tasks

**Load generation rules and template**:
- Read `rules/tasks-generation.md` from this skill's directory for principles
- If `sequential` is false: Read `rules/tasks-parallel-analysis.md` from this skill's directory for parallel judgement criteria
- Read `{{KIRO_DIR}}/settings/templates/specs/tasks.md` for format (supports `(P)` markers)

#### Parallel Research

The following research areas are independent and can be executed in parallel:
1. **Context loading**: Spec documents (requirements.md, design.md), steering files
2. **Rules loading**: tasks-generation.md, tasks-parallel-analysis.md, tasks template

If multi-agent is enabled, spawn sub-agents for each area above. Otherwise execute sequentially.

After all parallel research completes, synthesize findings before generating tasks.

**Generate task list following all rules**:
- Use language specified in spec.json
- Map all requirements to tasks
- When documenting requirement coverage, list numeric requirement IDs only (comma-separated) without descriptive suffixes, parentheses, translations, or free-form labels
- Ensure all design components included
- Verify task progression is logical and incremental
- Collapse single-subtask structures by promoting them to major tasks and avoid duplicating details on container-only major tasks (use template patterns accordingly)
- Apply `(P)` markers to tasks that satisfy parallel criteria (omit markers when sequential mode requested)
- Mark optional test coverage subtasks with `- [ ]*` only when they strictly cover acceptance criteria already satisfied by core implementation and can be deferred post-MVP
- If existing tasks.md found, merge with new content

### Step 3: Review Task Plan

- Keep the draft task plan in working memory; do NOT write `tasks.md` yet
- Run the `Task Plan Review Gate` from `rules/tasks-generation.md`
- Review coverage:
  - Every requirement ID appears in at least one task
  - Every design component, contract, integration point, runtime prerequisite, and validation concern is represented
- Review executability:
  - Each sub-task is an executable 1-3 hour work unit
  - Each sub-task has a verifiable deliverable
  - No implicit prerequisites remain hidden
  - `_Depends:_`, `_Boundary:_`, and `(P)` markers still match the dependency graph and architecture boundaries
- If issues are task-plan-local, repair the draft and re-run the review gate before writing
- Keep the review bounded to at most 2 repair passes
- If review exposes a real requirements/design gap or contradiction, stop and send the user back to requirements/design instead of inventing filler tasks

### Step 4: Finalize

**Write tasks.md**:
- Create/update `{{KIRO_DIR}}/specs/$1/tasks.md`
- Update spec.json metadata:
  - Set `phase: "tasks-generated"`
  - Set `approvals.tasks.generated: true, approved: false`
  - Set `approvals.requirements.approved: true`
  - Set `approvals.design.approved: true`
  - Update `updated_at` timestamp

**Approval**:
- If auto-approve flag (`-y`) is provided:
  - Set `approvals.tasks.approved: true` in spec.json
  - Display task summary (task count, major groups, parallel markers)
  - Respond: "Tasks generated and auto-approved. Start implementation with `/kiro-impl $1`"
- Otherwise (interactive):
  - Display a summary of the generated tasks (task count, major groups, parallel markers)
  - Ask the user: "Tasks generated. Approve and proceed to implementation?"
  - If the user approves:
    - Set `approvals.tasks.approved: true` in spec.json
    - Respond: "Tasks approved. Start implementation with `/kiro-impl $1`"
  - If the user wants changes:
    - Keep `approvals.tasks.approved: false`
    - Respond with guidance on what to adjust and re-run

## Critical Constraints
- **Task Integration**: Every task must connect to the system (no orphaned work)
- **Boundary annotations**: Required for `(P)` tasks, recommended for all (`_Boundary: ComponentName_`)
- **Explicit dependencies**: Cross-boundary non-obvious dependencies declared with `_Depends: X.X_`
- **Executable deliverable granularity**: Each task must produce a verifiable deliverable (file, endpoint, UI component, config). Infrastructure tasks (project scaffolding, manifest, host integration, build config) must be explicit — never assume they exist
- **No implicit prerequisites**: If a task requires a runtime, SDK, framework setup, or config file, that setup must be a separate preceding task
</instructions>

## Output Description

Provide brief summary in the language specified in spec.json:

1. **Status**: Confirm tasks generated at `{{KIRO_DIR}}/specs/$1/tasks.md`
2. **Task Summary**: 
   - Total: X major tasks, Y sub-tasks
   - All Z requirements covered
   - Average task size: 1-3 hours per sub-task
3. **Quality Validation**:
   - ✅ All requirements mapped to tasks
   - ✅ Design coverage and runtime prerequisites reviewed
   - ✅ Task dependencies verified
   - ✅ Task plan review gate passed
   - ✅ Testing tasks included
4. **Next Action**: Review tasks and proceed when ready

**Format**: Concise (under 200 words)

## Safety & Fallback

### Error Scenarios

**Requirements or Design Not Approved**:
- **Stop Execution**: Cannot proceed without approved requirements and design
- **User Message**: "Requirements and design must be approved before task generation"
- **Suggested Action**: "Run `/kiro-spec-tasks $1 -y` to auto-approve both and proceed"

**Missing Requirements or Design**:
- **Stop Execution**: Both documents must exist
- **User Message**: "Missing requirements.md or design.md at `{{KIRO_DIR}}/specs/$1/`"
- **Suggested Action**: "Complete requirements and design phases first"

**Incomplete Requirements Coverage**:
- **Warning**: "Not all requirements mapped to tasks. Review coverage."
- **User Action Required**: Confirm intentional gaps or regenerate tasks

**Spec Gap Found During Task Review**:
- **Stop Execution**: Do not write a patched-over `tasks.md`
- **User Message**: "Requirements/design do not provide enough clear coverage to generate an executable task plan"
- **Suggested Action**: "Refine requirements.md or design.md, then re-run `/kiro-spec-tasks $1`"

**Template/Rules Missing**:
- **User Message**: "Template or rules files missing in `{{KIRO_DIR}}/settings/`"
- **Fallback**: Use inline basic structure with warning
- **Suggested Action**: "Check repository setup or restore template files"
- **Missing Numeric Requirement IDs**:
  - **Stop Execution**: All requirements in requirements.md MUST have numeric IDs. If any requirement lacks a numeric ID, stop and request that requirements.md be fixed before generating tasks.

### Next Phase: Implementation

Tasks are approved in Step 4 via user confirmation. Once approved:
- Autonomous implementation: `/kiro-impl $1`
- Specific tasks only: `/kiro-impl $1 1.1,1.2`
