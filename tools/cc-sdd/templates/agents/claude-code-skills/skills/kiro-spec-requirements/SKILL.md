---
name: kiro-spec-requirements
description: Generate EARS-format requirements based on project description and steering context. Use when generating requirements from project description.
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, WebSearch, WebFetch, AskUserQuestion
metadata:
  shared-rules: "ears-format.md, requirements-review-gate.md"
---

# kiro-spec-requirements Skill

## Role
You are a specialized skill for generating comprehensive, testable requirements in EARS format based on the project description from spec initialization.

## Core Mission
- **Mission**: Generate comprehensive, testable requirements in EARS format based on the project description from spec initialization
- **Success Criteria**:
  - Create complete requirements document aligned with steering context
  - Follow the project's EARS patterns and constraints for all acceptance criteria
  - Focus on core functionality without implementation details
  - Update metadata to track generation status

## Execution Steps

### Step 1: Gather Context

If steering/spec context is already available from conversation, skip redundant file reads.
Otherwise, load all necessary context:
- Read `{{KIRO_DIR}}/specs/{feature}/spec.json` for language and metadata
- Read `{{KIRO_DIR}}/specs/{feature}/brief.md` if it exists (brainstorm context: problem, approach, scope decisions)
- Read `{{KIRO_DIR}}/specs/{feature}/requirements.md` for project description
- Core steering context: `product.md`, `tech.md`, `structure.md`
- Additional steering files only when directly relevant to feature scope, user personas, business/domain rules, compliance/security constraints, operational constraints, or existing product boundaries
- Relevant local agent skills or playbooks only when they clearly match the feature's host environment or use case and contain domain terminology or workflow rules that shape user-observable requirements

### Step 2: Read Guidelines
- Read `rules/ears-format.md` from this skill's directory for EARS syntax rules
- Read `rules/requirements-review-gate.md` from this skill's directory for pre-write review criteria
- Read `{{KIRO_DIR}}/settings/templates/specs/requirements.md` for document structure

#### Parallel Research (subagent dispatch)

The following research areas are independent. Decide the optimal decomposition based on project complexity -- split, merge, add, or skip subagents as needed.

**In main context** (essential for requirements generation):
- Spec files: spec.json, brief.md, requirements.md (project description)
- EARS format rules, requirements review gate, requirements template
- Core steering: product.md, tech.md (directly inform scope and constraints)

**Delegate to subagent via Agent tool** (keeps exploration out of main context):
- **Codebase hints** (brownfield projects): Dispatch a subagent to explore existing implementations that inform requirement scope. Example prompt: "Explore this codebase for existing features related to [feature area]. Summarize: (1) what already exists, (2) relevant interfaces/APIs, (3) patterns that new requirements should align with. Return a summary under 150 lines."
- **Domain research** (when external knowledge is needed): Dispatch a subagent for WebSearch/WebFetch to research domain-specific requirements, standards, or best practices. Return a concise findings summary.
- **Additional steering and playbooks**: If many steering files or local agent playbooks exist, dispatch a subagent to scan them and return only the sections relevant to this feature.

For greenfield projects with minimal codebase, skip subagent dispatch and load context directly.

After all research completes, synthesize findings in main context before generating requirements.

### Step 3: Generate Requirements Draft
- Create initial requirements draft based on project description
- Group related functionality into logical requirement areas
- Apply EARS format to all acceptance criteria
- Use language specified in spec.json
- Keep this as a draft until the review gate passes; do not write `requirements.md` yet

### Step 4: Review Requirements Draft
- Run the `Requirements Review Gate` from `rules/requirements-review-gate.md`
- Review coverage, EARS compliance, ambiguity, and scope boundaries before finalizing
- If issues are local to the draft, repair the requirements and review again
- Keep the review bounded to at most 2 repair passes
- If the draft exposes a real scope ambiguity or contradiction, stop and ask the user to clarify instead of writing guessed requirements

### Step 5: Finalize and Update Metadata
- Write `{{KIRO_DIR}}/specs/{feature}/requirements.md` only after the requirements review gate passes
- Set `phase: "requirements-generated"`
- Set `approvals.requirements.generated: true`
- Update `updated_at` timestamp

## Important Constraints

### Requirements Scope: WHAT, not HOW
Requirements describe user-observable behavior, not implementation. Use this to decide what belongs here vs. in design:

**Ask the user about (requirements scope):**
- Functional scope — what is included and what is excluded
- User-observable behavior — "when X happens, what should the user see/experience?"
- Business rules and edge cases — limits, error conditions, special cases
- Non-functional requirements visible to users — response time expectations, availability, security level

**Do not ask about (design scope — defer to design phase):**
- Technology stack choices (database, framework, language)
- Architecture patterns (microservices, monolith, event-driven)
- API design, data models, internal component structure
- How to achieve non-functional requirements (caching strategy, scaling approach)

**Litmus test**: If an EARS acceptance criterion can be written without mentioning any technology, it belongs in requirements. If it requires a technology choice, it belongs in design.

### Other Constraints
- Each requirement must be testable and unambiguous. If the project description leaves room for multiple interpretations on scope, behavior, or boundary conditions, ask the user to clarify before generating that requirement. Ask as many questions as needed; do not generate requirements that contain your own assumptions.
- Requirements must be testable and verifiable
- Choose appropriate subject for EARS statements (system/service name for software)
- Requirement headings in requirements.md MUST include a leading numeric ID only (for example: "Requirement 1", "1.", "2 Feature ..."); do not use alphabetic IDs like "Requirement A".
- **Context Discipline**: Start with core steering and expand only with requirement-relevant steering or use-case-aligned local agent skills/playbooks

## Tool Guidance
- **Read first**: Load spec, brief.md, core steering, rules, and templates in main context before generation
- **Agent tool**: Delegate codebase exploration, domain research, and bulk steering scanning to subagents. Each returns a findings summary, keeping the main context clean for generation.
- **Write last**: Update requirements.md only after complete generation
- **WebSearch/WebFetch**: For domain knowledge. Prefer delegating via Agent to avoid loading raw results into main context.

## Output Description
Provide output in the language specified in spec.json with:

1. **Generated Requirements Summary**: Brief overview of major requirement areas (3-5 bullets)
2. **Document Status**: Confirm requirements.md updated and spec.json metadata updated
3. **Review Gate**: Confirm the requirements review gate passed
4. **Next Steps**: Guide user on how to proceed (approve and continue, or modify)

**Format Requirements**:
- Use Markdown headings for clarity
- Include file paths in code blocks
- Keep summary concise (under 300 words)

## Safety & Fallback

### Error Scenarios
- **Missing Project Description**: If requirements.md lacks project description, ask user for feature details
- **Ambiguous Requirements**: Ask the user to clarify before generating. Do not generate requirements based on assumptions.
- **Template Missing**: If template files don't exist, use inline fallback structure with warning
- **Language Undefined**: Default to English (`en`) if spec.json doesn't specify language
- **Incomplete Requirements**: After generation, explicitly ask user if requirements cover all expected functionality
- **Steering Directory Empty**: Warn user that project context is missing and may affect requirement quality
- **Non-numeric Requirement Headings**: If existing headings do not include a leading numeric ID (for example, they use "Requirement A"), normalize them to numeric IDs and keep that mapping consistent (never mix numeric and alphabetic labels).
- **Scope Ambiguity Found During Requirements Review**: Stop execution, do not write a guessed `requirements.md`, and ask the user to clarify the missing or conflicting scope before re-running `/kiro-spec-requirements {feature}`

### Next Phase: Design Generation

**If Requirements Approved**:
- **Optional Gap Analysis** (for existing codebases):
  - Run `/kiro-validate-gap {feature}` to analyze implementation gap
  - Recommended for brownfield projects; skip for greenfield
- Run `/kiro-spec-design {feature}` to proceed to design phase
- Or `/kiro-spec-design {feature} -y` to auto-approve requirements and proceed directly

**If Modifications Needed**:
- Provide feedback and re-run `/kiro-spec-requirements {feature}`
