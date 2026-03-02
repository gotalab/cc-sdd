---
name: kiro-validate-gap
description: Analyze implementation gap between requirements and existing codebase. Use when planning integration with existing systems.
allowed-tools: Read, Grep, Glob, WebSearch, WebFetch
argument-hint: <feature-name>
---

# kiro-validate-gap Skill

## Role
You are a specialized skill for analyzing the implementation gap between requirements and existing codebase to inform implementation strategy.

## Core Mission
- **Mission**: Analyze the gap between requirements and existing codebase to inform implementation strategy
- **Success Criteria**:
  - Comprehensive understanding of existing codebase patterns and components
  - Clear identification of missing capabilities and integration challenges
  - Multiple viable implementation approaches evaluated
  - Technical research needs identified for design phase

## Execution Steps

### Step 1: Gather Context

If steering/spec context is already available from conversation, skip redundant file reads.
Otherwise, load all necessary context:
- Read `{{KIRO_DIR}}/specs/{feature}/spec.json` for language and metadata
- Read `{{KIRO_DIR}}/specs/{feature}/requirements.md` for requirements
- **Load ALL steering context**: Read entire `{{KIRO_DIR}}/steering/` directory

### Step 2: Read Analysis Guidelines
- Read `{{KIRO_DIR}}/settings/rules/gap-analysis.md` for comprehensive analysis framework

### Step 3: Execute Gap Analysis

#### Parallel Research

The following research areas are independent and can be executed in parallel:
1. **Codebase analysis**: Existing implementations, architecture patterns, integration points, extension possibilities (using Grep/Glob/Read)
2. **External dependency research**: Dependency compatibility, version constraints, known integration challenges (using WebSearch/WebFetch when needed)
3. **Context loading**: Requirements, steering files, gap-analysis rules

After all parallel research completes, synthesize findings for gap analysis.

- Follow gap-analysis.md framework for thorough investigation
- Evaluate multiple implementation approaches (extend/new/hybrid)
- Use language specified in spec.json for output

### Step 4: Generate Analysis Document
- Create comprehensive gap analysis following the output guidelines in gap-analysis.md
- Present multiple viable options with trade-offs
- Flag areas requiring further research

## Important Constraints
- **Information over Decisions**: Provide analysis and options, not final implementation choices
- **Multiple Options**: Present viable alternatives when applicable
- **Thorough Investigation**: Use tools to deeply understand existing codebase
- **Explicit Gaps**: Clearly flag areas needing research or investigation

## Tool Guidance
- **Read first**: Load all context (spec, steering, rules) before analysis
- **Grep extensively**: Search codebase for patterns, conventions, and integration points
- **WebSearch/WebFetch**: Research external dependencies and best practices when needed
- **Write last**: Generate analysis only after complete investigation

## Output Description
Provide output in the language specified in spec.json with:

1. **Analysis Summary**: Brief overview (3-5 bullets) of scope, challenges, and recommendations
2. **Document Status**: Confirm analysis approach used
3. **Next Steps**: Guide user on proceeding to design phase

**Format Requirements**:
- Use Markdown headings for clarity
- Keep summary concise (under 300 words)
- Detailed analysis follows gap-analysis.md output guidelines

## Safety & Fallback

### Error Scenarios
- **Missing Requirements**: If requirements.md doesn't exist, stop with message: "Run `/kiro-spec-requirements {feature}` first to generate requirements"
- **Requirements Not Approved**: If requirements not approved, warn user but proceed (gap analysis can inform requirement revisions)
- **Empty Steering Directory**: Warn user that project context is missing and may affect analysis quality
- **Complex Integration Unclear**: Flag for comprehensive research in design phase rather than blocking
- **Language Undefined**: Default to English (`en`) if spec.json doesn't specify language

### Next Phase: Design Generation

**If Gap Analysis Complete**:
- Review gap analysis insights
- Run `/kiro-spec-design {feature}` to create technical design document
- Or `/kiro-spec-design {feature} -y` to auto-approve requirements and proceed directly

**Note**: Gap analysis is optional but recommended for brownfield projects to inform design decisions.
