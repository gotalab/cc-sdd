---
name: kiro-spec-status
description: Show specification status and progress
---


# Specification Status

<background_information>
- **Success Criteria**:
  - Show current phase and completion status
  - Identify next actions and blockers
  - Provide clear visibility into progress
  - Surface boundary readiness, upstream/downstream context, and likely revalidation needs when available
</background_information>

<instructions>
## Execution Steps

### Step 1: Load Spec Context
- Read `{{KIRO_DIR}}/specs/$1/spec.json` for metadata and phase status
- Read `{{KIRO_DIR}}/specs/$1/brief.md` if it exists
- Read existing files: `requirements.md`, `design.md`, `tasks.md` (if they exist)
- Check `{{KIRO_DIR}}/specs/$1/` directory for available files
- Read `{{KIRO_DIR}}/steering/roadmap.md` if it exists and this spec appears in it

### Step 2: Analyze Status

**Parse each phase**:
- **Requirements**: Count requirements and acceptance criteria
- **Design**: Check for architecture, components, diagrams, and whether boundary sections are present
- **Tasks**: Count completed vs total tasks (parse `- [x]` vs `- [ ]`)
- **Approvals**: Check approval status in spec.json
- **Boundary context**:
  - From brief.md: note `Boundary Candidates`, `Upstream / Downstream`, and `Existing Spec Touchpoints` if present
  - From design.md: note `Boundary Commitments`, `Out of Boundary`, `Allowed Dependencies`, and `Revalidation Triggers` if present
  - From roadmap.md: note upstream dependencies and whether this spec is adjacent to `Existing Spec Updates`
- **Revalidation watchlist**:
  - Identify downstream specs, neighboring existing-spec updates, or rollout-sensitive design notes that may need revalidation if this spec changes
  - Call out when the current spec shape looks too broad and may want roadmap/design splitting instead of more local repair

### Step 3: Generate Report

Create report in the language specified in spec.json covering:
1. **Current Phase & Progress**: Where the spec is in the workflow
2. **Completion Status**: Percentage complete for each phase
3. **Task Breakdown**: If tasks exist, show completed/remaining counts
4. **Boundary Context**: Upstream/downstream, out-of-boundary, and allowed dependency notes when available
5. **Revalidation Watchlist**: Downstream or adjacent work likely affected by changes to this spec
6. **Next Actions**: What needs to be done next
7. **Blockers**: Any issues preventing progress

</instructions>

## Safety & Fallback

### Error Scenarios

**Spec Not Found**:
- **Message**: "No spec found for `$1`. Check available specs in `{{KIRO_DIR}}/specs/`"
- **Action**: List available spec directories

**Incomplete Spec**:
- **Warning**: Identify which files are missing
- **Suggested Action**: Point to next phase command

### List All Specs

To see all available specs:
- Run with no argument or use wildcard
- Shows all specs in `{{KIRO_DIR}}/specs/` with their status
