---
name: kiro-spec-batch
description: Create complete specs (requirements, design, tasks) for all features in roadmap.md using parallel sub-agent dispatch by dependency wave.
---


# Spec Batch

<background_information>
- **Success Criteria**:
  - All features have complete spec files (spec.json, requirements.md, design.md, tasks.md)
  - Dependency ordering respected (upstream specs complete before downstream)
  - Independent features processed in parallel via sub-agent dispatch
  - Cross-spec consistency verified (data models, interfaces, naming)
  - Mixed roadmap context understood without breaking `## Specs (dependency order)` parsing
  - Controller context stays lightweight (sub-agents do the heavy work)
</background_information>

<instructions>

## Step 1: Read Roadmap and Validate

1. Read `{{KIRO_DIR}}/steering/roadmap.md`
2. Parse the `## Specs (dependency order)` section to extract:
   - Feature names
   - One-line descriptions
   - Dependencies for each feature
   - Completion status (`[x]` = done, `[ ]` = pending)
3. If present, also read for context:
   - `## Existing Spec Updates`
   - `## Direct Implementation Candidates`
   Do not include these in dependency-wave execution; they are awareness-only inputs for sequencing and consistency review.
4. For each pending feature in `## Specs (dependency order)`, verify `{{KIRO_DIR}}/specs/<feature>/brief.md` exists
5. If any brief.md is missing, stop and report: "Missing brief.md for: [list]. Run `/kiro-discovery` to generate briefs first."

## Step 2: Build Dependency Waves

Group pending features into waves based on dependencies:

- **Wave 1**: Features with no dependencies (or all dependencies already completed `[x]`)
- **Wave 2**: Features whose dependencies are all in Wave 1 or already completed
- **Wave N**: Features whose dependencies are all in earlier waves or already completed

Display the execution plan:
```
Spec Batch Plan:
  Wave 1 (parallel): app-foundation
  Wave 2 (parallel): block-editor, page-management
  Wave 3 (parallel): sidebar-navigation, database-views
  Wave 4 (parallel): cli-integration
  Total: 6 specs across 4 waves
```

If roadmap contains `## Existing Spec Updates` or `## Direct Implementation Candidates`, mention them separately as non-batch items so the user can see the whole decomposition.

## Step 3: Execute Waves

For each wave, dispatch all features in the wave as **parallel sub-agents**.

**For each feature in the wave**, spawn a sub-agent with this task:

```
Create a complete specification for feature "{feature-name}".

1. Read the brief at {{KIRO_DIR}}/specs/{feature-name}/brief.md for feature context
2. Read the roadmap at {{KIRO_DIR}}/steering/roadmap.md for project context
3. Execute the full spec pipeline. For each phase, read the corresponding skill's SKILL.md for complete instructions (templates, rules, review gates):
   a. Initialize: Read .github/skills/kiro-spec-init/SKILL.md, then create spec.json and requirements.md
   b. Generate requirements: Read .github/skills/kiro-spec-requirements/SKILL.md, then follow its steps
   c. Generate design: Read .github/skills/kiro-spec-design/SKILL.md, then follow its steps
   d. Generate tasks: Read .github/skills/kiro-spec-tasks/SKILL.md, then follow its steps
4. Set all approvals to true in spec.json (auto-approve mode, equivalent of -y flag)
5. Report completion with file list and task count
```

If multi-agent is not available, execute features in the wave sequentially.

**After all sub-agents in the wave complete**:
1. Verify each feature has: spec.json, requirements.md, design.md, tasks.md
2. If any feature failed, report the error and continue with features that succeeded
3. Display wave completion: "Wave N complete: [features]. Files verified."
4. Proceed to next wave

## Step 4: Cross-Spec Review

After all waves complete, spawn a **single sub-agent** for cross-spec consistency review. This is the highest-value quality gate -- it catches issues that per-spec review gates cannot.

**Sub-agent task**:

Read ALL generated specs and check for consistency across the entire project:
- `{{KIRO_DIR}}/specs/*/design.md` (primary: contains interfaces, data models, architecture)
- `{{KIRO_DIR}}/specs/*/requirements.md` (for scope and acceptance criteria)
- `{{KIRO_DIR}}/specs/*/tasks.md` (for boundary annotations only -- read _Boundary:_ lines, skip task descriptions)
- `{{KIRO_DIR}}/steering/roadmap.md`

Reading priority: Focus on design.md files (they contain interfaces, data models, architecture). For requirements.md, focus on section headings and acceptance criteria. For tasks.md, focus on _Boundary:_ annotations.

Check:
1. **Data model consistency**: Same entities defined consistently across specs (field names, types, relationships)
2. **Interface alignment**: Where spec A outputs what spec B consumes, do contracts match exactly?
3. **No duplicate functionality**: Any capability specified in more than one spec?
4. **Dependency completeness**: Every design.md references correct upstream specs? Implicit dependencies not in roadmap?
5. **Naming conventions**: Component names, file paths, API routes, table names consistent across specs?
6. **Shared infrastructure**: Shared concerns (auth, error handling, logging) handled in one spec and correctly referenced?
7. **Task boundary alignment**: Task _Boundary:_ annotations partition codebase cleanly? No files claimed by multiple specs?
8. **Roadmap boundary continuity**: If roadmap includes `Existing Spec Updates` or `Direct Implementation Candidates`, do the generated new specs avoid absorbing that work by accident?

Output: CONSISTENT areas + ISSUES with (which specs, what's inconsistent, suggested fix).

**After the review sub-agent returns**:
- **Critical/important issues found**: Dispatch fix sub-agents for each affected spec to apply the suggested fixes. Re-run cross-spec review after fixes (max 3 remediation rounds).
- **Minor issues only**: Report them for user awareness, proceed to Step 5.
- **No issues**: Proceed to Step 5.

## Step 5: Finalize

1. Scan `{{KIRO_DIR}}/specs/*/tasks.md` to verify all specs exist
2. For each completed spec, read spec.json to confirm phase and approvals
3. Update roadmap.md: mark completed specs as `[x]`
4. If roadmap.md includes `Existing Spec Updates` or `Direct Implementation Candidates`, leave them untouched and mention them as remaining follow-up items unless already explicitly completed elsewhere

Display final summary:
```
Spec Batch Complete:
  ✓ app-foundation: X requirements, Y design components, Z tasks
  ✓ block-editor: ...
  ✓ page-management: ...
  ...
  Total: N specs created, M tasks generated
  Cross-spec review: PASSED / N issues found (M fixed)
  Existing spec updates pending: <count or none>
  Direct implementation candidates pending: <count or none>

Next: Review generated specs, then start implementation with /kiro-impl <feature>
```

</instructions>

## Critical Constraints
- **Controller stays lightweight**: Only read roadmap.md and brief.md existence checks in main context. All spec generation happens in sub-agents.
- **Wave ordering is strict**: Never start a wave until all features in previous waves are complete.
- **Parallel within waves**: All features in the same wave should be dispatched in parallel if multi-agent is available.
- **No partial waves**: If a feature in a wave fails, still complete the other features in that wave before reporting.
- **Skip completed specs**: Features with `[x]` in roadmap.md or existing tasks.md are skipped.
- **`## Specs (dependency order)` remains authoritative for batch execution**: Other roadmap sections are context, not wave inputs.

## Safety & Fallback

**Sub-agent failure**:
- Log the error, skip the failed feature
- Continue with remaining features in the wave
- Report failed features in the summary
- Suggest: "Run `/kiro-spec-quick <feature> --auto` manually for failed features."

**Circular dependencies**:
- If dependency graph has cycles, report the cycle and stop
- Suggest: "Fix dependency ordering in roadmap.md"

**Roadmap not found**:
- Stop and report: "No roadmap.md found. Run `/kiro-discovery` first."

**All specs already complete**:
- Report: "All specs in roadmap.md are already complete. Nothing to do."
