---
name: kiro-spec-batch
description: Create complete specs (requirements, design, tasks) for all features in roadmap.md using parallel subagent dispatch by dependency wave.
allowed-tools: Read, Glob, Grep, Agent
---

# kiro-spec-batch Skill

## Role
You are a batch orchestrator that creates complete specifications for all features defined in roadmap.md. You dispatch parallel subagents for independent features and respect dependency ordering.

## Core Mission
- **Mission**: Create requirements.md, design.md, and tasks.md for all features in roadmap.md via parallel spec-quick dispatch, then validate cross-spec consistency
- **Success Criteria**:
  - All features have complete spec files (spec.json, requirements.md, design.md, tasks.md)
  - Dependency ordering respected (upstream specs complete before downstream)
  - Independent features processed in parallel via subagent dispatch
  - Cross-spec consistency verified (data models, interfaces, naming)
  - Controller context stays lightweight (subagents do the heavy work)

## Execution Steps

### Step 1: Read Roadmap and Validate

1. Read `{{KIRO_DIR}}/steering/roadmap.md`
2. Parse the `## Specs (dependency order)` section to extract:
   - Feature names
   - One-line descriptions
   - Dependencies for each feature
   - Completion status (`[x]` = done, `[ ]` = pending)
3. For each pending feature, verify `{{KIRO_DIR}}/specs/<feature>/brief.md` exists
4. If any brief.md is missing, stop and report: "Missing brief.md for: [list]. Run `/kiro-brainstorm` to generate briefs first."

### Step 2: Build Dependency Waves

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

### Step 3: Execute Waves

For each wave, dispatch all features in the wave as **parallel subagents** via the Agent tool.

**For each feature in the wave**, dispatch a subagent with this prompt:

```
Create a complete specification for feature "{feature-name}".

1. Read the brief at {{KIRO_DIR}}/specs/{feature-name}/brief.md for feature context
2. Read the roadmap at {{KIRO_DIR}}/steering/roadmap.md for project context
3. Execute the full spec pipeline. For each phase, read the corresponding skill's SKILL.md for complete instructions (templates, rules, review gates):
   a. Initialize: Read .claude/skills/kiro-spec-init/SKILL.md, then create spec.json and requirements.md
   b. Generate requirements: Read .claude/skills/kiro-spec-requirements/SKILL.md, then follow its steps
   c. Generate design: Read .claude/skills/kiro-spec-design/SKILL.md, then follow its steps
   d. Generate tasks: Read .claude/skills/kiro-spec-tasks/SKILL.md, then follow its steps
4. Set all approvals to true in spec.json (auto-approve mode, equivalent of -y flag)
5. Report completion with file list and task count
```

**After all subagents in the wave complete**:
1. Verify each feature has: spec.json, requirements.md, design.md, tasks.md
2. If any feature failed, report the error and continue with features that succeeded
3. Display wave completion: "Wave N complete: [features]. Files verified."
4. Proceed to next wave

### Step 4: Cross-Spec Review

After all waves complete, dispatch a **single subagent** (use `model: "opus"` for Claude Code) for cross-spec consistency review. This is the highest-value quality gate -- it catches issues that per-spec review gates cannot.

**Subagent prompt**:

```
You are a cross-spec reviewer. Read ALL generated specs and check for consistency across the entire project.

Read these files for every feature in the roadmap:
- {{KIRO_DIR}}/specs/*/design.md (primary: contains interfaces, data models, architecture)
- {{KIRO_DIR}}/specs/*/requirements.md (for scope and acceptance criteria)
- {{KIRO_DIR}}/specs/*/tasks.md (for boundary annotations only -- read _Boundary:_ lines, skip task descriptions)
- {{KIRO_DIR}}/steering/roadmap.md

Context budget: Prioritize design.md files (they contain the interfaces). For requirements.md, read section headings and acceptance criteria. For tasks.md, only read _Boundary:_ annotations. If total content exceeds ~3000 lines, skip tasks.md and check boundaries from design.md's File Structure Plan instead.

Check the following:

1. **Data model consistency**: Do all specs that reference the same entities (tables, types, interfaces) define them consistently? Are field names, types, and relationships aligned?

2. **Interface alignment**: Where spec A produces output that spec B consumes (APIs, events, shared state), do the contracts match exactly? Are request/response shapes, event payloads, and error codes consistent?

3. **No duplicate functionality**: Is any capability specified in more than one spec? Flag overlaps.

4. **Dependency completeness**: Does every spec's design.md reference the correct upstream specs? Are there implicit dependencies not declared in roadmap.md?

5. **Naming conventions**: Are component names, file paths, API routes, and database table names consistent across all specs?

6. **Shared infrastructure**: Are shared concerns (authentication, error handling, logging, configuration) handled in one spec and correctly referenced by others?

7. **Task boundary alignment**: Do task _Boundary:_ annotations across specs partition the codebase cleanly? Are there files claimed by multiple specs?

Output format:
- CONSISTENT: [list areas that are well-aligned]
- ISSUES: [list each issue with: which specs, what's inconsistent, suggested fix]
- If no issues found: "All specs are consistent. Ready for implementation."
```

**After the review subagent returns**:
- **Critical/important issues found**: Dispatch fix subagents for each affected spec to apply the suggested fixes. Re-run cross-spec review after fixes (max 3 remediation rounds).
- **Minor issues only**: Report them for user awareness, proceed to Step 5.
- **No issues**: Proceed to Step 5.

### Step 5: Finalize

1. Glob `{{KIRO_DIR}}/specs/*/tasks.md` to verify all specs exist
2. For each completed spec, read spec.json to confirm phase and approvals
3. Update roadmap.md: mark completed specs as `[x]`

Display final summary:
```
Spec Batch Complete:
  ✓ app-foundation: X requirements, Y design components, Z tasks
  ✓ block-editor: ...
  ✓ page-management: ...
  ...
  Total: N specs created, M tasks generated
  Cross-spec review: PASSED / N issues found (M fixed)

Next: Review generated specs, then start implementation with /kiro-impl <feature>
```

## Critical Constraints
- **Controller stays lightweight**: Only read roadmap.md and brief.md existence checks in main context. All spec generation happens in subagents.
- **Wave ordering is strict**: Never start a wave until all features in previous waves are complete.
- **Parallel within waves**: All features in the same wave MUST be dispatched in parallel via Agent tool, not sequentially.
- **No partial waves**: If a feature in a wave fails, still complete the other features in that wave before reporting.
- **Skip completed specs**: Features with `[x]` in roadmap.md or existing tasks.md are skipped.

## Tool Guidance
- **Read**: Load roadmap.md (Step 1), verify brief.md existence, read spec.json for verification (Step 4)
- **Glob**: Discover existing spec files, verify completeness
- **Grep**: Quick checks on spec.json fields
- **Agent**: Dispatch one subagent per feature per wave. Each subagent runs the full spec pipeline independently.

## Output Description
1. **Execution plan**: Waves with feature groupings
2. **Wave progress**: Completion status after each wave
3. **Final summary**: Per-feature results (requirement count, task count) + next steps

## Safety & Fallback

**Missing brief.md**:
- Stop before execution. Report missing briefs.
- Suggest: "Run `/kiro-brainstorm` to generate briefs for all features."

**Subagent failure**:
- Log the error, skip the failed feature
- Continue with remaining features in the wave
- Report failed features in the summary
- Suggest: "Run `/kiro-spec-quick <feature> --auto` manually for failed features."

**Circular dependencies**:
- If dependency graph has cycles, report the cycle and stop
- Suggest: "Fix dependency ordering in roadmap.md"

**Roadmap not found**:
- Stop and report: "No roadmap.md found. Run `/kiro-brainstorm` first."

**All specs already complete**:
- Report: "All specs in roadmap.md are already complete. Nothing to do."
