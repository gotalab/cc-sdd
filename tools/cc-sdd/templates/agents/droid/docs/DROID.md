# Droid + Kiro Spec Workflow

Kiro-style Spec Driven Development for Factory Droid (interactive `droid` and headless `droid exec`).

## Locations
- Commands: `.factory/commands/`
- Droids (subagents): `.factory/droids/`
- Shared settings: `{{KIRO_DIR}}/settings/`
- Specs: `{{KIRO_DIR}}/specs/`

## Quickstart (Kiro commands)
- `/kiro:spec-quick <what-to-build>` (all phases) or the phased flow:
  - `/kiro:spec-init "description"`
  - `/kiro:spec-requirements {feature}`
  - `/kiro:validate-gap {feature}` (optional: brownfield)
  - `/kiro:spec-design {feature} [-y]`
  - `/kiro:validate-design {feature}` (optional)
  - `/kiro:spec-tasks {feature} [-y]`
  - `/kiro:spec-impl {feature} [tasks]`
  - `/kiro:validate-impl {feature}` (optional)
  - `/kiro:spec-status {feature}` (progress)

## Autonomy (Droid)
- Interactive `droid`: approve changes in TUI.
- Headless `droid exec`: default read-only; enable writes with `--auto low|medium|high`; `--skip-permissions-unsafe` is unsafe and should be avoided outside sandboxes.

## Development Rules
- Requirements → Design → Tasks → Implementation with human review each phase; use `-y` only when intentionally fast-tracking.
- Keep steering current (`/kiro:steering`, `/kiro:steering-custom`).
- Follow user instructions precisely; ask only when critical info is missing.

## Steering Configuration
- Load entire `{{KIRO_DIR}}/steering/` as project memory (default: `product.md`, `tech.md`, `structure.md`).
- Add custom steering via `/kiro:steering-custom`.
