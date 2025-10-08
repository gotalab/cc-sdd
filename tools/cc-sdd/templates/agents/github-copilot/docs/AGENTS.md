# AI-DLC and Spec-Driven Development

Kiro-style Spec Driven Development implementation on AI-DLC (AI Development Life Cycle)

## Project Context

### Paths
- Steering: `{{KIRO_DIR}}/steering/`
- Specs: `{{KIRO_DIR}}/specs/`

### Steering vs Specification

**Steering** (`{{KIRO_DIR}}/steering/`) - Guide AI with project-wide rules and context
**Specs** (`{{KIRO_DIR}}/specs/`) - Formalize development process for individual features

### Active Specifications
- Check `{{KIRO_DIR}}/specs/` for active specifications
- Use `/spec-status [feature-name]` to check progress

## Development Guidelines
{{DEV_GUIDELINES}}

## Minimal Workflow
- Phase 0 (optional): `/steering`, `/steering-custom`
- Phase 1 (Specification):
  - `/spec-init "description"`
  - `/spec-requirements {feature}`
  - `/validate-gap {feature}` (optional: for existing codebase)
  - `/spec-design {feature} [-y]`
  - `/validate-design {feature}` (optional: design review)
  - `/spec-tasks {feature} [-y]`
- Phase 2 (Implementation): `/spec-impl {feature} [tasks]`
  - `/validate-impl {feature}` (optional: after implementation)
- Progress check: `/spec-status {feature}` (use anytime)

## Development Rules
- 3-phase approval workflow: Requirements → Design → Tasks → Implementation
- Human review required each phase; use `-y` only for intentional fast-track
- Keep steering current and verify alignment with `/spec-status`

## Steering Configuration
- Load entire `{{KIRO_DIR}}/steering/` as project memory
- Default files: `product.md`, `tech.md`, `structure.md`
- Custom files are supported (managed via `/steering-custom`)
