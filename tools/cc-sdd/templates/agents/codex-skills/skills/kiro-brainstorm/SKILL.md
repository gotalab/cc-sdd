---
name: kiro-brainstorm
description: Entry point for new work. Determines the best action path (update existing spec, create new spec, multi-spec decomposition, or no spec needed) and refines ideas through structured dialogue.
---


# Brainstorm

<background_information>
- **Success Criteria**:
  - Correct action path identified based on existing project state
  - User's intent clarified through questions, not assumptions
  - Output is an actionable next step (not just a description)
</background_information>

<instructions>

## Step 1: Lightweight Scan

Gather **only metadata** to determine the action path. Do NOT read full file contents yet.

- **Specs inventory**: Scan `{{KIRO_DIR}}/specs/*/spec.json` for `name`, `phase` fields and `approvals` status. Note feature names and their current status.
- **Steering existence**: Check which files exist in `{{KIRO_DIR}}/steering/` (product.md, tech.md, structure.md, roadmap.md). Do NOT read their contents yet.
- **Roadmap check**: If `{{KIRO_DIR}}/steering/roadmap.md` exists, read it. This contains project-level context (approach, scope, constraints, spec list) from a previous brainstorm session. Use it to restore project context.
- **Top-level structure**: List the project root directory to note key directories and files. Do NOT recurse into subdirectories.

This step should consume minimal context. If `specs/` is empty and no steering exists, note "greenfield project" and move to Step 2.

## Step 2: Determine Action Path

Based on the user's request and the metadata from Step 1, determine which path applies:

**Path A: Existing spec covers this**
- The request is an extension, enhancement, or fix within an existing spec's domain
- Action: Recommend updating the existing spec
- Output: "This fits within the `{feature}` spec. Run `$kiro-spec-requirements {feature}` to update requirements."
- Skip remaining steps

**Path B: No spec needed**
- The request is a bug fix, config change, simple refactor, or trivial addition
- Action: Recommend direct implementation
- Output: "This is small enough to implement directly without a spec."
- Skip remaining steps

**Path C: New single-scope feature**
- The request is new, doesn't overlap with existing specs, and fits in one spec
- Action: Continue to Step 3

**Path D: Multi-scope decomposition needed**
- The request spans multiple domains or would produce 20+ tasks in a single spec
- Action: Continue to Step 3

Present the determined path to the user and confirm before proceeding.

## Step 3: Deep Context Loading

**Only for Path C and D.** Now load the context needed for brainstorming.

**In main context** (essential for dialogue with user):
- **Steering documents**: Read product.md and tech.md (if they exist) for project goals, constraints, and tech stack
- **Relevant specs**: If the request is adjacent to an existing spec, read that spec's requirements.md to understand boundaries and avoid overlap

**Delegate to sub-agent** (keeps exploration out of main context):
- **Codebase exploration**: Spawn a sub-agent to explore the codebase and return a structured summary. Ask it to summarize: (1) tech stack and frameworks, (2) directory structure and key modules, (3) patterns and conventions used, (4) areas relevant to the user's request. The sub-agent returns findings under 200 lines.
- For Path D (multi-scope), also ask the sub-agent to identify natural domain boundaries and existing module separation.
- Skip sub-agent dispatch for small/obvious requests where the top-level directory listing from Step 1 is sufficient.

**Context budget**: Keep total content loaded into main context under ~500 lines. The sub-agent handles the heavy exploration.

## Step 4: Understand the Idea

Ask clarifying questions **sequentially** (not all at once):

1. **Who and why**: Who has the problem? What pain does it cause?
2. **Current state**: What exists today? What's the gap?
3. **Desired outcome**: What should be true when this is done?
4. **Scope**: What is explicitly OUT of scope? What's the minimum viable version?
5. **Constraints**: Are there technology, timeline, or compatibility constraints?

Ask only questions whose answers you cannot infer from the context already loaded. Skip questions that steering documents already answer. If the user already provided a clear description, skip to Step 5.

## Step 5: Propose Approaches

Propose **2-3 concrete approaches** with trade-offs:

For each approach:
- **Approach name**: One-line summary
- **How it works**: 2-3 sentences on the technical approach
- **Pros**: What makes this approach good
- **Cons**: What are the risks or downsides
- **Scope estimate**: Rough complexity (small / medium / large)

If technical research is needed (unfamiliar framework, library evaluation), spawn a sub-agent to research and return a concise summary. Ask it to compare options, check latest versions, and note known issues. Raw search results never enter the main context.

Recommend one approach and explain why.

**After the user selects an approach**, spawn a sub-agent to verify viability before proceeding to Step 6. Ask it to check: (1) Are these technologies still actively maintained? (2) Any license incompatibilities (e.g., GPL contamination)? (3) Do the components actually work together for the use case? (4) Any known showstoppers (critical bugs, security vulnerabilities, platform limitations)? Return only issues found, or "No issues found" if everything checks out.

If the viability check reveals issues, present them to the user and revisit the approach selection. If no issues, proceed to Step 6.

## Step 6: Refine and Confirm

- Address user's questions or concerns about the approaches
- Narrow scope if needed: favor smaller, deliverable increments
- For Path D: propose feature decomposition with dependency ordering
  - Each feature = one spec (Epic level)
  - Dependencies between specs are explicit
  - Consider vertical slices (end-to-end value) vs horizontal layers (one layer at a time) based on the project needs
- Confirm the final direction

## Step 7: Write Files to Disk

**CRITICAL: You MUST write these files to disk BEFORE suggesting any next command. Conversation text does not survive session boundaries. If you skip this step, all brainstorm analysis is lost when the session ends.**

**For Path C (single spec)**:

Write `{{KIRO_DIR}}/specs/<feature-name>/brief.md` to disk with this structure:

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

## Constraints
[technology, compatibility, or other constraints]
```

**For Path D (multi-spec decomposition)**:

Write **both** files to disk:

**File 1**: `{{KIRO_DIR}}/steering/roadmap.md`

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

## Specs (dependency order)
- [ ] feature-a -- [one-line description]. Dependencies: none
- [ ] feature-b -- [one-line description]. Dependencies: feature-a
- [ ] feature-c -- [one-line description]. Dependencies: feature-a, feature-b
```

**File 2+**: `{{KIRO_DIR}}/specs/<feature>/brief.md` for **every** feature listed in roadmap.md (same format as Path C). Write each brief to disk. This enables parallel spec creation via `$kiro-spec-batch`.

**Re-entry (roadmap.md already exists)**:
Write the next spec's brief.md to disk. Update roadmap.md if scope/ordering changed.

After writing, verify the files exist by reading them back.

## Step 8: Suggest Next Steps

**Only after Step 7 files are confirmed written**, suggest the next command:
- Path C: `$kiro-spec-init <feature-name>`
- Path D: `$kiro-spec-batch` (creates all specs in parallel based on roadmap.md dependency order)
- Re-entry: `$kiro-spec-init <next-feature-name>` or `$kiro-spec-batch` if multiple specs remain

</instructions>

## Critical Constraints
- **MUST write files before suggesting next command**: For Path C/D, write brief.md and roadmap.md to disk. Do NOT just display the content in conversation -- files on disk are the only thing that survives session boundaries.

## Safety & Fallback

**Roadmap Already Exists (re-entry)**:
- Read roadmap.md to restore project context before asking questions
- Determine next spec based on completed specs' status
- Write brief.md for the next spec only (just-in-time)
- Update roadmap.md if scope/ordering changed based on implementation experience
- Append new specs as a new phase if the request expands the project, don't overwrite existing content
