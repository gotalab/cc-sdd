# Agentic SDLC and Spec-Driven Development

Kiro-style Spec-Driven Development on an agentic SDLC

## Project Memory
Project memory keeps persistent guidance (steering, specs notes, component docs) so Windsurf honors your standards each run. Treat it as the long-lived source of truth for patterns, conventions, and decisions.

- Use `{{KIRO_DIR}}/steering/` for project-wide policies: architecture principles, naming schemes, security constraints, tech stack decisions, api standards, etc.
- Use local `AGENTS.md` files for feature or library context (e.g. `src/lib/payments/AGENTS.md`): describe domain assumptions, API contracts, or testing conventions specific to that folder. Windsurf auto-loads these when working in the matching path.
- Specs notes stay with each spec (under `{{KIRO_DIR}}/specs/`) to guide specification-level workflows.

## Project Context

### Paths
- Steering: `{{KIRO_DIR}}/steering/`
- Specs: `{{KIRO_DIR}}/specs/`

### Steering vs Specification

**Steering** (`{{KIRO_DIR}}/steering/`) - Guide AI with project-wide rules and context
**Specs** (`{{KIRO_DIR}}/specs/`) - Formalize development process for individual features

### Active Specifications
- Check `{{KIRO_DIR}}/specs/` for active specifications
- Use `@kiro-spec-status [feature-name]` to check progress

## Development Guidelines
<!-- DEV_GUIDELINES: injected at install time with language-specific guidelines (npx cc-sdd@latest --lang <code>) -->
{{DEV_GUIDELINES}}

## Minimal Workflow
- Phase 0 (optional): `@kiro-steering`, `@kiro-steering-custom`
- Discovery: `@kiro-discovery "idea"` — determines action path, writes brief.md + roadmap.md for multi-spec projects
- Phase 1 (Specification):
  - Single spec: `@kiro-spec-quick {feature} [--auto]` or step by step:
    - `@kiro-spec-init "description"`
    - `@kiro-spec-requirements {feature}`
    - `@kiro-validate-gap {feature}` (optional: for existing codebase)
    - `@kiro-spec-design {feature} [-y]`
    - `@kiro-validate-design {feature}` (optional: design review)
    - `@kiro-spec-tasks {feature} [-y]`
  - Multi-spec: `@kiro-spec-batch` — creates all specs from roadmap.md in parallel by dependency wave
- Phase 2 (Implementation): `@kiro-impl {feature} [tasks] [--review required|inline|off]`
  - Without task numbers: autonomous mode (subagent per task + independent review + final validation)
  - With task numbers: manual mode (selected tasks in main context, still reviewer-gated before completion)
  - `--review off` skips task-local review; use it intentionally and keep `@kiro-validate-impl {feature}` as the final quality gate
  - `@kiro-validate-impl {feature}` (standalone re-validation)
- Progress check: `@kiro-spec-status {feature}` (use anytime)

## Skills Structure
Skills are located in `.windsurf/skills/kiro-*/SKILL.md`
- Each skill is a directory with a `SKILL.md` file
- Use `/skills` to inspect currently available skills
- Invoke a skill directly with `@kiro-<skill-name>`
- **If there is even a 1% chance a skill applies to the current task, invoke it.** Do not skip skills because the task seems simple.
- `kiro-review` — task-local adversarial review protocol used by reviewer subagents
- `kiro-debug` — root-cause-first debug protocol used by debugger subagents
- `kiro-verify-completion` — fresh-evidence gate before success or completion claims

> Windsurf does not support programmatic sub-agent dispatch. Skills that reference parallel sub-agents will execute sequentially in the main context.

## Development Rules
- 3-phase approval workflow: Requirements → Design → Tasks → Implementation
- Human review required each phase; use `-y` only for intentional fast-track
- Keep steering current and verify alignment with `@kiro-spec-status`
- Follow the user's instructions precisely, and within that scope act autonomously: gather the necessary context and complete the requested work end-to-end in this run, asking questions only when essential information is missing or the instructions are critically ambiguous.

## Steering Configuration
- Load entire `{{KIRO_DIR}}/steering/` as project memory
- Default files: `product.md`, `tech.md`, `structure.md`
- Custom files are supported (managed via `@kiro-steering-custom`)
