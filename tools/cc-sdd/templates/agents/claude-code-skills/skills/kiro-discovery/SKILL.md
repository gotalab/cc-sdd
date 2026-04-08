---
name: kiro-discovery
description: Entry point for new work. Determines the best action path or work decomposition (update existing spec, create new spec, mixed decomposition, or no spec needed) and refines ideas through structured dialogue.
disable-model-invocation: true
allowed-tools: Read, Write, Glob, Grep, Agent, WebSearch, WebFetch, AskUserQuestion
argument-hint: <idea-or-request>
---

# kiro-discovery Skill

## Core Mission
- **Success Criteria**:
  - Correct action path or work decomposition identified based on existing project state
  - User's intent clarified through questions, not assumptions
  - Output is an actionable next step (not just a description)

## Execution Steps

### Step 1: Lightweight Scan

Gather **only metadata** to determine the action path. Do NOT read full file contents yet.

- **Specs inventory**: Glob `{{KIRO_DIR}}/specs/*/spec.json`, read each spec.json for `name`, `phase` fields and `approvals` status. Note feature names and their current status.
- **Steering existence**: Check which files exist in `{{KIRO_DIR}}/steering/` (product.md, tech.md, structure.md, roadmap.md). Do NOT read their contents yet.
- **Roadmap check**: If `{{KIRO_DIR}}/steering/roadmap.md` exists, read it. This contains project-level context (approach, scope, constraints, spec list) from a previous discovery session. Use it to restore project context.
- **Top-level structure**: List the project root directory to note key directories and files. Do NOT recurse into subdirectories.

This step should consume minimal context. If `specs/` is empty and no steering exists, note "greenfield project" and move to Step 2.

### Step 2: Determine Action Path

Based on the user's request and the metadata from Step 1, determine which path applies:

**Path A: Existing spec covers this**
- The request is an extension, enhancement, or fix within an existing spec's domain
- Every meaningful part of the request fits that same spec boundary
- Any remaining small follow-up work can be handled directly without creating a new spec
- Skip remaining steps

**Path B: No spec needed**
- The request is a bug fix, config change, simple refactor, or trivial addition
- No meaningful part of the request needs a new or updated spec boundary
- The request does not need to update an existing spec either
- Skip remaining steps

**Path C: New single-scope feature**
- The request is new, doesn't overlap with existing specs, and fits in one spec

**Path D: Multi-scope decomposition needed**
- The request spans multiple domains or would produce 20+ tasks in a single spec

**Path E: Mixed decomposition**
- The request contains a mix of: existing spec extensions, one or more new spec candidates, and optional direct-implementation work
- Use this path only when at least one genuinely new spec boundary is needed

For Path C/D/E, present the determined path (or mixed decomposition) to the user and confirm before proceeding.
For Path A/B, recommend the next action and stop.

### Step 3: Deep Context Loading

**Only for Path C, D, and E.** Now load the context needed for discovery.

**In main context** (essential for dialogue with user):
- **Steering documents**: Read product.md and tech.md (if they exist) for project goals, constraints, and tech stack
- **Relevant specs**: If the request is adjacent to an existing spec, read that spec's requirements.md to understand boundaries and avoid overlap

**Delegate to subagent via Agent tool** (keeps exploration out of main context):
- **Codebase exploration**: Dispatch a subagent to explore the codebase and return a structured summary. Example prompt: "Explore this project's codebase. Summarize: (1) tech stack and frameworks, (2) directory structure and key modules, (3) patterns and conventions used, (4) areas relevant to [user's request]. Return a summary under 200 lines."
- The subagent uses Read/Glob/Grep to explore, then returns findings. Only the summary enters the main context.
- For Path D/E, also ask the subagent to identify natural domain boundaries, existing module separation, and which areas look like existing-spec extensions vs new boundaries.
- Skip subagent dispatch for small/obvious requests where the top-level directory listing from Step 1 is sufficient.

**Context budget**: Keep total content loaded into main context under ~500 lines. The subagent handles the heavy exploration.

### Step 4: Understand the Idea

Ask clarifying questions **sequentially** (not all at once), prioritizing boundary discovery over feature detail:

1. **Who and why**: Who has the problem? What pain does it cause?
2. **Desired outcome**: What should be true when this is done?
3. **Boundary candidates**: What are the natural responsibility seams in this work? Where could this be split so implementation can proceed independently?
4. **Out of boundary**: What should this spec explicitly NOT own, even if related?
5. **Existing vs new**: Which parts seem like extensions to existing specs, and which parts look like genuinely new boundaries?
6. **Upstream / downstream**: What existing systems, specs, or components does this depend on? What future work is likely to depend on this?
7. **Constraints**: Are there technology, timeline, or compatibility constraints?

Ask only questions whose answers you cannot infer from the context already loaded. Skip questions that steering documents already answer. If the user already provided a clear description, skip to Step 5.
The goal is NOT to assign final owners yet. The goal is to discover the cleanest responsibility boundaries that can later become specs, tasks, and review scopes.

### Step 5: Propose Approaches

Propose **2-3 concrete approaches** with trade-offs:

For each approach:
- **Approach name**: One-line summary
- **How it works**: 2-3 sentences on the technical approach
- **Pros**: What makes this approach good
- **Cons**: What are the risks or downsides
- **Scope estimate**: Rough complexity (small / medium / large)

If technical research is needed (unfamiliar framework, library evaluation), dispatch a subagent via Agent tool. Example prompt: "Research [topic]: compare options, check latest versions, note known issues. Return a summary of findings with recommendation." The subagent uses WebSearch/WebFetch and returns a concise summary. Raw search results never enter the main context.

Recommend one approach and explain why.

**After the user selects an approach**, dispatch a subagent to verify viability before proceeding to Step 6. Example prompt: "Verify the viability of this technical approach: [chosen tech stack / key libraries]. Check: (1) Are these technologies still actively maintained? (2) Any license incompatibilities (e.g., GPL contamination)? (3) Do the components actually work together for [use case]? (4) Any known showstoppers (critical bugs, security vulnerabilities, platform limitations)? Return only issues found, or 'No issues found' if everything checks out."

If the viability check reveals issues, present them to the user and revisit the approach selection. If no issues, proceed to Step 6.

### Step 6: Refine and Confirm

- Address user's questions or concerns about the approaches
- Narrow scope if needed: favor smaller, deliverable increments and cleaner responsibility seams
- For Path D/E: propose work decomposition with dependency ordering
  - Each new boundary-worthy feature = one spec
  - Existing spec extensions are explicitly listed with their target spec
  - Truly small direct-implementation items are listed separately instead of being forced into a spec
  - Dependencies between specs/workstreams are explicit
  - Consider vertical slices (end-to-end value) vs horizontal layers (one layer at a time) based on the project needs
- Confirm the final direction

### Step 7: Write Files to Disk

**CRITICAL: You MUST use the Write tool to create these files BEFORE suggesting any next command. Conversation text does not survive session boundaries. If you skip this step, all discovery analysis is lost when the session ends.**

**For Path C (single spec)**:

Use the Write tool to create `{{KIRO_DIR}}/specs/<feature-name>/brief.md` with this structure:

```
# Brief: <feature-name>

## Problem
[who has the problem, what pain it causes]

## Current State
[what exists today, what's the gap]

## Desired Outcome
[what should be true when done]

## Approach
[chosen approach and why]

## Scope
- **In**: [what this feature includes]
- **Out**: [what's explicitly excluded]

## Boundary Candidates
- [responsibility seam 1]
- [responsibility seam 2]

## Out of Boundary
- [explicit non-goals this spec does not own]

## Upstream / Downstream
- **Upstream**: [existing systems/specs this depends on]
- **Downstream**: [likely consumers or follow-on specs]

## Existing Spec Touchpoints
- **Extends**: [existing spec(s) this work updates, if any]
- **Adjacent**: [neighbor specs or modules to avoid overlapping]

## Constraints
[technology, compatibility, or other constraints]
```

**For Path D (multi-spec decomposition)**:

Use the Write tool to create:
- `{{KIRO_DIR}}/steering/roadmap.md`
- `{{KIRO_DIR}}/specs/<feature>/brief.md` for every feature listed under `## Specs (dependency order)`

Use this roadmap structure:

```
# Roadmap

## Overview
[Project goal and chosen approach -- 1-2 paragraphs]

## Approach Decision
- **Chosen**: [approach name and summary]
- **Why**: [key reasoning]
- **Rejected alternatives**: [what was considered and why it was rejected]

## Scope
- **In**: [what the overall project includes]
- **Out**: [what is explicitly excluded]

## Constraints
[technology, compatibility, timeline, or other project-wide constraints]

## Boundary Strategy
- **Why this split**: [why these spec boundaries improve independence]
- **Shared seams to watch**: [cross-spec boundaries needing careful review]

## Specs (dependency order)
- [ ] feature-a -- [one-line description]. Dependencies: none
- [ ] feature-b -- [one-line description]. Dependencies: feature-a
- [ ] feature-c -- [one-line description]. Dependencies: feature-a, feature-b
```

Then create `{{KIRO_DIR}}/specs/<feature>/brief.md` for **every** feature listed under `## Specs (dependency order)` using the Path C brief format. This enables parallel spec creation via `/kiro-spec-batch`.

**For Path E (mixed decomposition)**:

Use the same roadmap structure as Path D, plus these additional sections:

```
## Existing Spec Updates
- [ ] existing-feature-a -- [one-line description of the extension]. Dependencies: none
- [ ] existing-feature-b -- [one-line description of the extension]. Dependencies: feature-a

## Direct Implementation Candidates
- [ ] small-item-a -- [why this stays direct implementation]
- [ ] small-item-b -- [why this stays direct implementation]

## Specs (dependency order)
- [ ] new-feature-a -- [one-line description]. Dependencies: none
- [ ] new-feature-b -- [one-line description]. Dependencies: new-feature-a
```

Path E rules:
- Keep `## Specs (dependency order)` reserved for **new specs only** so `/kiro-spec-batch` can still parse it unchanged
- Record existing-spec extensions under `## Existing Spec Updates`
- Record true no-spec work under `## Direct Implementation Candidates`
- Create `brief.md` only for the **new specs** listed under `## Specs (dependency order)`

**Re-entry (roadmap.md already exists)**:
Use the Write tool to create the next new spec's brief.md. Update roadmap.md with Write tool if scope/ordering changed, preserving completed items and prior phases.

After writing, verify the files exist by reading them back.

### Step 8: Suggest Next Steps

Suggest the next command and stop. Do NOT automatically run downstream spec generation from this skill.

- Path A: `/kiro-spec-requirements {feature}` to update the existing spec
- Path B: Recommend direct implementation without creating a spec
- Path C: Default to `/kiro-spec-init <feature-name>`
  - Optional fast path: `/kiro-spec-quick <feature-name>` when the user explicitly wants to continue immediately
- Path D: Default to `/kiro-spec-batch` (creates all specs in parallel based on roadmap.md dependency order)
  - Optional cautious path: `/kiro-spec-init <first-feature-name>` when the user wants to validate the first slice before batching the rest
- Path E: Choose the next command based on the new-spec portion of the decomposition
  - If there is exactly one new spec: `/kiro-spec-init <new-feature-name>`
  - If there are multiple new specs: `/kiro-spec-batch`
  - Also note which existing specs should be revisited with `/kiro-spec-requirements <feature>`
- Re-entry: `/kiro-spec-init <next-feature-name>` or `/kiro-spec-batch` if multiple specs remain

If the decomposition contains only existing-spec updates plus direct implementation candidates, do NOT use Path E. Prefer Path A when one existing spec is the clear home, or recommend the existing-spec update plus direct implementation work without creating roadmap entries.

## Critical Constraints
- **Files on disk are the source of continuity**: For Path C/D/E, create brief.md and roadmap.md as needed before suggesting the next command. Do NOT leave discovery results only in conversation text.

## Safety & Fallback

**Roadmap Already Exists (re-entry)**:
- Read roadmap.md to restore project context before asking questions
- Determine next spec based on completed specs' status
- Write brief.md for the next spec only (just-in-time)
- Update roadmap.md if scope/ordering changed based on implementation experience
- Append new specs as a new phase if the request expands the project, don't overwrite existing content
