---
name: kiro-spec-design
description: Generate comprehensive technical design translating requirements (WHAT) into architecture (HOW) with discovery process. Use when creating architecture from requirements.
allowed-tools: Read, Write, Edit, Grep, Glob, WebSearch, WebFetch
argument-hint: <feature-name> [-y]
metadata:
  shared-rules: "design-principles.md, design-discovery-full.md, design-discovery-light.md, design-synthesis.md"
---

# kiro-spec-design Skill

## Role
You are a specialized skill for generating comprehensive technical design documents that translate requirements (WHAT) into architectural design (HOW).

## Core Mission
- **Mission**: Generate comprehensive technical design document that translates requirements (WHAT) into architectural design (HOW)
- **Success Criteria**:
  - All requirements mapped to technical components with clear interfaces
  - Appropriate architecture discovery and research completed
  - Design aligns with steering context and existing patterns
  - Visual diagrams included for complex architectures

## Execution Steps

### Step 1: Gather Context

If steering/spec context is already available from conversation, skip redundant file reads.
Otherwise, load all necessary context:
- `{{KIRO_DIR}}/specs/{feature}/spec.json`, `requirements.md`, `design.md` (if exists)
- **Entire `{{KIRO_DIR}}/steering/` directory** for complete project memory
- `{{KIRO_DIR}}/settings/templates/specs/design.md` for document structure
- Read `rules/design-principles.md` from this skill's directory for design principles

**Validate requirements approval**:
- If auto-approve flag is true: Auto-approve requirements in spec.json
- Otherwise: Verify approval status (stop if unapproved, see Safety & Fallback)

### Step 2: Discovery & Analysis

**Critical: This phase ensures design is based on complete, accurate information.**

1. **Classify Feature Type**:
   - **New Feature** (greenfield) → Full discovery required
   - **Extension** (existing system) → Integration-focused discovery
   - **Simple Addition** (CRUD/UI) → Minimal or no discovery
   - **Complex Integration** → Comprehensive analysis required

2. **Execute Appropriate Discovery Process**:

   **For Complex/New Features**:
   - Read and execute `rules/design-discovery-full.md` from this skill's directory
   - Conduct thorough research using WebSearch/WebFetch:
     - Latest architectural patterns and best practices
     - External dependency verification (APIs, libraries, versions, compatibility)
     - Official documentation, migration guides, known issues
     - Performance benchmarks and security considerations

   **For Extensions**:
   - Read and execute `rules/design-discovery-light.md` from this skill's directory
   - Focus on integration points, existing patterns, compatibility
   - Use Grep to analyze existing codebase patterns

   **For Simple Additions**:
   - Skip formal discovery, quick pattern check only

#### Parallel Research

The following research areas are independent and can be executed in parallel. The agent should determine optimal decomposition based on feature complexity:
1. **Codebase analysis**: Existing architecture patterns, integration points, code conventions (using Grep/Glob)
2. **External research**: Dependencies, APIs, latest best practices (using WebSearch/WebFetch when needed)
3. **Context loading**: Steering files, design principles, discovery rules, templates

After all parallel research completes, synthesize findings before proceeding.

3. **Retain Discovery Findings for Step 3**:
   - External API contracts and constraints
   - Technology decisions with rationale
   - Existing patterns to follow or extend
   - Integration points and dependencies
   - Identified risks and mitigation strategies

### Step 3: Synthesis

**Apply design synthesis to discovery findings before writing.**

- Read and apply `rules/design-synthesis.md` from this skill's directory
- This step requires the full picture from discovery — do not parallelize or delegate to sub-agents
- Record synthesis outcomes (generalizations found, build-vs-adopt decisions, simplifications) in `research.md`

### Step 4: Generate Design Document

1. **Load Design Template and Rules**:
   - Read `{{KIRO_DIR}}/settings/templates/specs/design.md` for structure
   - Read `rules/design-principles.md` from this skill's directory for principles

2. **Generate Design Document**:
   - **Follow specs/design.md template structure and generation instructions strictly**
   - **Integrate all discovery findings and synthesis outcomes**: Use researched information (APIs, patterns, technologies) and synthesis decisions (generalizations, build-vs-adopt, simplifications) throughout component definitions, architecture decisions, and integration points
   - If existing design.md found in Step 1, use it as reference context (merge mode)
   - Apply design rules: Type Safety, Visual Communication, Formal Tone
   - Use language specified in spec.json

3. **Update Metadata** in spec.json:

   - Set `phase: "design-generated"`
   - Set `approvals.design.generated: true, approved: false`
   - Set `approvals.requirements.approved: true`
   - Update `updated_at` timestamp

## Critical Constraints
 - **Type Safety**:
   - Enforce strong typing aligned with the project's technology stack.
   - For statically typed languages, define explicit types/interfaces and avoid unsafe casts.
   - For TypeScript, never use `any`; prefer precise types and generics.
   - For dynamically typed languages, provide type hints/annotations where available (e.g., Python type hints) and validate inputs at boundaries.
   - Document public interfaces and contracts clearly to ensure cross-component type safety.
- **Latest Information**: Use WebSearch/WebFetch for external dependencies and best practices
- **Steering Alignment**: Respect existing architecture patterns from steering context
- **Template Adherence**: Follow specs/design.md template structure and generation instructions strictly
- **Design Focus**: Architecture and interfaces ONLY, no implementation code
- **Requirements Traceability IDs**: Use numeric requirement IDs only (e.g. "1.1", "1.2", "3.1", "3.3") exactly as defined in requirements.md. Do not invent new IDs or use alphabetic labels.

## Tool Guidance
- **Read first**: Load all context before taking action (specs, steering, templates, rules)
- **Research when uncertain**: Use WebSearch/WebFetch for external dependencies, APIs, and latest best practices
- **Analyze existing code**: Use Grep to find patterns and integration points in codebase
- **Write last**: Generate design.md only after all research and analysis complete

## Output Description

**Command execution output** (separate from design.md content):

Provide brief summary in the language specified in spec.json:

1. **Status**: Confirm design document generated at `{{KIRO_DIR}}/specs/{feature}/design.md`
2. **Discovery Type**: Which discovery process was executed (full/light/minimal)
3. **Key Findings**: 2-3 critical insights from discovery that shaped the design
4. **Next Action**: Approval workflow guidance (see Safety & Fallback)

**Format**: Concise Markdown (under 200 words) - this is the command output, NOT the design document itself

**Note**: The actual design document follows `{{KIRO_DIR}}/settings/templates/specs/design.md` structure.

## Safety & Fallback

### Error Scenarios

**Requirements Not Approved**:
- **Stop Execution**: Cannot proceed without approved requirements
- **User Message**: "Requirements not yet approved. Approval required before design generation."
- **Suggested Action**: "Run `/kiro-spec-design {feature} -y` to auto-approve requirements and proceed"

**Missing Requirements**:
- **Stop Execution**: Requirements document must exist
- **User Message**: "No requirements.md found at `{{KIRO_DIR}}/specs/{feature}/requirements.md`"
- **Suggested Action**: "Run `/kiro-spec-requirements {feature}` to generate requirements first"

**Template Missing**:
- **User Message**: "Template file missing at `{{KIRO_DIR}}/settings/templates/specs/design.md`"
- **Suggested Action**: "Check repository setup or restore template file"
- **Fallback**: Use inline basic structure with warning

**Steering Context Missing**:
- **Warning**: "Steering directory empty or missing - design may not align with project standards"
- **Proceed**: Continue with generation but note limitation in output

**Discovery Complexity Unclear**:
- **Default**: Use full discovery process (`rules/design-discovery-full.md` from this skill's directory)
- **Rationale**: Better to over-research than miss critical context
- **Invalid Requirement IDs**:
  - **Stop Execution**: If requirements.md is missing numeric IDs or uses non-numeric headings (for example, "Requirement A"), stop and instruct the user to fix requirements.md before continuing.

### Next Phase: Task Generation

**If Design Approved**:
- **Optional**: Run `/kiro-validate-design {feature}` for interactive quality review
- Run `/kiro-spec-tasks {feature}` to generate implementation tasks
- Or `/kiro-spec-tasks {feature} -y` to auto-approve and proceed directly

**If Modifications Needed**:
- Provide feedback and re-run `/kiro-spec-design {feature}`
- Existing design used as reference (merge mode)
