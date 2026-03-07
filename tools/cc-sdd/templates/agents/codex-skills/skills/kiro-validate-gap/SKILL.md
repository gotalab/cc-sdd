---
name: kiro-validate-gap
description: Analyze implementation gap between requirements and existing codebase
metadata:
  shared-rules: "gap-analysis.md"
---


# Implementation Gap Validation

<background_information>
- **Mission**: Analyze the gap between requirements and existing codebase to inform implementation strategy
- **Success Criteria**:
  - Comprehensive understanding of existing codebase patterns and components
  - Clear identification of missing capabilities and integration challenges
  - Multiple viable implementation approaches evaluated
  - Technical research needs identified for design phase
</background_information>

<instructions>
## Core Task
Analyze implementation gap for feature **$1** based on approved requirements and existing codebase.

## Execution Steps

1. **Load Context**:
   - Read `{{KIRO_DIR}}/specs/$1/spec.json` for language and metadata
   - Read `{{KIRO_DIR}}/specs/$1/requirements.md` for requirements
   - Core steering context: `product.md`, `tech.md`, `structure.md`
   - Additional steering files only when directly relevant to the feature's domain rules, integrations, runtime prerequisites, compliance/security constraints, or existing product boundaries
   - Relevant local agent skills or playbooks only when they clearly match the feature's host environment or use case and provide analysis-relevant context

2. **Read Analysis Guidelines**:
   - Read `rules/gap-analysis.md` from this skill's directory for comprehensive analysis framework

#### Parallel Research

The following research areas are independent and can be executed in parallel:
1. **Codebase analysis**: Existing implementations, architecture patterns, integration points, extension possibilities
2. **External dependency research**: Dependency compatibility, version constraints, known integration challenges (when needed)
3. **Context loading**: Requirements, core steering, task-relevant extra steering, relevant local agent skills/playbooks, and gap-analysis rules

If multi-agent is enabled, spawn sub-agents for each area above. Otherwise execute sequentially.

After all parallel research completes, synthesize findings for gap analysis.

3. **Execute Gap Analysis**:
   - Follow gap-analysis.md framework for thorough investigation
   - Analyze existing codebase using Grep and Read tools
   - Use WebSearch/WebFetch for external dependency research if needed
   - Evaluate multiple implementation approaches (extend/new/hybrid)
   - Use language specified in spec.json for output

4. **Generate Analysis Document**:
   - Create comprehensive gap analysis following the output guidelines in gap-analysis.md
   - Present multiple viable options with trade-offs
   - Flag areas requiring further research

## Important Constraints
- **Information over Decisions**: Provide analysis and options, not final implementation choices
- **Multiple Options**: Present viable alternatives when applicable
- **Thorough Investigation**: Use tools to deeply understand existing codebase
- **Explicit Gaps**: Clearly flag areas needing research or investigation
- **Context Discipline**: Start with core steering and expand only with analysis-relevant steering or use-case-aligned local agent skills/playbooks
</instructions>

## Tool Guidance
- **Read first**: Load spec, core steering, relevant local playbooks/agent skills, and rules before analysis
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
- **Missing Requirements**: If requirements.md doesn't exist, stop with message: "Run `$kiro-spec-requirements $1` first to generate requirements"
- **Requirements Not Approved**: If requirements not approved, warn user but proceed (gap analysis can inform requirement revisions)
- **Empty Steering Directory**: Warn user that project context is missing and may affect analysis quality
- **Complex Integration Unclear**: Flag for comprehensive research in design phase rather than blocking
- **Language Undefined**: Default to English (`en`) if spec.json doesn't specify language

### Next Phase: Design Generation

**If Gap Analysis Complete**:
- Review gap analysis insights
- Run `$kiro-spec-design $1` to create technical design document
- Or `$kiro-spec-design $1 -y` to auto-approve requirements and proceed directly

**Note**: Gap analysis is optional but recommended for brownfield projects to inform design decisions.
