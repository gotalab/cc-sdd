---
name: kiro-brainstorm
description: Refine a vague idea into a concrete project description before starting spec-driven development. Optional — skip if you already know what to build.
---


# Brainstorm

<background_information>
- **Mission**: Through structured dialogue, refine a vague idea into a clear project description containing (a) who has the problem, (b) current situation, (c) what should change, and (d) scope boundaries
- **Success Criteria**:
  - User's intent is clarified through questions, not assumptions
  - 2-3 concrete approaches are proposed with trade-offs
  - User approves one approach
  - Output is a ready-to-use project description for `$kiro-spec-init`
</background_information>

<instructions>

## Step 1: Explore Context

Before asking questions, silently gather context:
- Read existing steering documents (product.md, tech.md, structure.md) if they exist
- Scan the codebase structure to understand the current state
- Check for existing specs in `{{KIRO_DIR}}/specs/` to avoid overlap
- Note the tech stack, frameworks, patterns already in use

## Step 2: Understand the Idea

Start with the user's rough idea (`$1`) and ask clarifying questions **sequentially** (not all at once):

1. **Who and why**: Who has the problem? What pain does it cause?
2. **Current state**: What exists today? What's the gap?
3. **Desired outcome**: What should be true when this is done?
4. **Scope**: What is explicitly OUT of scope? What's the minimum viable version?
5. **Constraints**: Are there technology, timeline, or compatibility constraints?

Ask only questions whose answers you cannot infer from the codebase context. Skip questions that steering documents already answer.

## Step 3: Propose Approaches

Based on the answers, propose **2-3 concrete approaches** with trade-offs:

For each approach:
- **Approach name**: One-line summary
- **How it works**: 2-3 sentences on the technical approach
- **Pros**: What makes this approach good
- **Cons**: What are the risks or downsides
- **Scope estimate**: Rough complexity (small / medium / large)

Recommend one approach and explain why.

## Step 4: Refine and Confirm

- Address user's questions or concerns about the approaches
- Narrow scope if needed — favor smaller, deliverable increments
- Confirm the final direction

## Step 5: Output Project Description

Once the user approves an approach, output a ready-to-use project description:

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

</instructions>

## Critical Constraints
- **No spec files**: Do NOT create spec.json, requirements.md, design.md, or tasks.md
- **No assumptions**: Ask questions instead of guessing the user's intent
- **Sequential questions**: Ask 1-2 questions at a time, not a wall of questions
- **Codebase-aware**: Use existing context to skip obvious questions
- **Scope discipline**: Push for smaller scope when the idea is too large for a single spec

## Output Description

A refined project description in structured format, ready to paste into `$kiro-spec-init`. No files created.

## Safety & Fallback

**Idea Too Large**:
- Suggest breaking into multiple features with sequencing plan

**Idea Already Specced**:
- If matching spec exists in `{{KIRO_DIR}}/specs/`, inform user and suggest reviewing it

**User Already Knows What to Build**:
- If the description is already clear, skip to Step 5 and confirm — don't over-question
