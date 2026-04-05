---
name: kiro-brainstorm
description: Entry point for new work. Determines the best action path (update existing spec, create new spec, multi-spec decomposition, or no spec needed) and refines ideas through structured dialogue.
---


# Brainstorm

<background_information>
- **Mission**: Determine the best action path for the user's request, and if brainstorming is needed, refine it into a concrete plan through structured dialogue
- **Success Criteria**:
  - Correct action path identified based on existing project state
  - User's intent clarified through questions, not assumptions
  - Output is an actionable next step (not just a description)
</background_information>

<instructions>

## Step 1: Explore Context

Before asking questions, silently gather context:
- Read existing steering documents (product.md, tech.md, structure.md) if they exist
- Scan `{{KIRO_DIR}}/specs/` for existing specs: feature names, phase status, approved/pending
- Scan the codebase structure to understand the current state
- Note the tech stack, frameworks, patterns already in use

## Step 2: Determine Action Path

Based on the user's request and the context from Step 1, determine which path applies:

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
- Action: Continue to Step 3 for brainstorming, then output a project description for `$kiro-spec-init`

**Path D: Multi-scope decomposition needed**
- The request spans multiple domains or would produce 20+ tasks in a single spec
- Action: Continue to Step 3 for brainstorming with decomposition, then write `{{KIRO_DIR}}/steering/roadmap.md`

Present the determined path to the user and confirm before proceeding.

## Step 3: Understand the Idea

For Path C and D only. Ask clarifying questions **sequentially** (not all at once):

1. **Who and why**: Who has the problem? What pain does it cause?
2. **Current state**: What exists today? What's the gap?
3. **Desired outcome**: What should be true when this is done?
4. **Scope**: What is explicitly OUT of scope? What's the minimum viable version?
5. **Constraints**: Are there technology, timeline, or compatibility constraints?

Ask only questions whose answers you cannot infer from the codebase context. Skip questions that steering documents already answer. If the user already provided a clear description, skip to Step 4.

## Step 4: Propose Approaches

Propose **2-3 concrete approaches** with trade-offs:

For each approach:
- **Approach name**: One-line summary
- **How it works**: 2-3 sentences on the technical approach
- **Pros**: What makes this approach good
- **Cons**: What are the risks or downsides
- **Scope estimate**: Rough complexity (small / medium / large)

Recommend one approach and explain why.

## Step 5: Refine and Confirm

- Address user's questions or concerns about the approaches
- Narrow scope if needed: favor smaller, deliverable increments
- For Path D: propose feature decomposition with dependency ordering
  - Each feature = one spec (Epic level)
  - Dependencies between specs are explicit
  - Consider vertical slices (end-to-end value) vs horizontal layers (one layer at a time) based on the project needs
- Confirm the final direction

## Step 6: Output and Next Steps

**For Path C (single spec)**:
Output a project description:
```
## Project Description

**Who**: [who has the problem]
**Current situation**: [what exists today, what's the gap]
**What should change**: [desired outcome]
**Approach**: [chosen approach summary]
**Scope**: [what's in, what's explicitly out]
**Constraints**: [technology, compatibility, or other constraints]
```
Then suggest: `$kiro-spec-init <feature-name>`

**For Path D (multi-spec decomposition)**:
Output a project description (same as above), plus write `{{KIRO_DIR}}/steering/roadmap.md`:

```markdown
# Roadmap

## Overview
[One paragraph describing the overall project goal and chosen approach]

## Specs (dependency order)
- [ ] feature-a -- [one-line description]. Dependencies: none
- [ ] feature-b -- [one-line description]. Dependencies: feature-a
- [ ] feature-c -- [one-line description]. Dependencies: feature-a, feature-b
...
```

Then suggest: `$kiro-spec-init <first-feature-name>`

If `roadmap.md` already exists, append a new section (e.g., `## Phase 2: ...`) rather than overwriting.

</instructions>

## Critical Constraints
- **Action path first**: Always determine the action path (Step 2) before brainstorming. Do not brainstorm when the answer is "update existing spec" or "no spec needed."
- **No spec files**: Do NOT create spec.json, requirements.md, design.md, or tasks.md. Only roadmap.md (steering) is written.
- **No assumptions**: Ask questions instead of guessing the user's intent
- **Sequential questions**: Ask 1-2 questions at a time, not a wall of questions
- **Codebase-aware**: Use existing context to skip obvious questions
- **Scope discipline**: Push for smaller scope when the idea is too large for a single spec
- **Existing specs respected**: Never suggest creating a new spec that overlaps with an existing spec's domain

## Output Description

Depends on action path:
- Path A: One-line recommendation + command to run
- Path B: One-line recommendation (no spec needed)
- Path C: Project description + `$kiro-spec-init` command
- Path D: Project description + roadmap.md written to steering + `$kiro-spec-init` for first spec

## Safety & Fallback

**Idea Too Large for Single Spec**:
- Switch to Path D (multi-spec decomposition)

**Existing Spec Overlap**:
- Recommend Path A (update existing). Do NOT create a new spec that duplicates an existing domain.

**User Already Knows What to Build**:
- Minimize questions and move quickly to the output step

**Roadmap Already Exists**:
- Append new specs as a new phase, don't overwrite existing content
