---
name: kiro-spec-design
description: Create the technical design for a feature spec (design.md + research.md as needed) under {{KIRO_DIR}}/specs/<feature>/, using repo steering and templates.
metadata:
  short-description: Create design
---

# Kiro Spec Design

## Usage

- Invoke: `$kiro-spec-design <feature-name>`

## Procedure

1. Read context:
   - `{{KIRO_DIR}}/specs/<feature>/spec.json`
   - `{{KIRO_DIR}}/specs/<feature>/requirements.md`
   - All steering: `{{KIRO_DIR}}/steering/*.md`
2. Read templates/rules:
   - `{{KIRO_DIR}}/settings/templates/specs/design.md`
   - `{{KIRO_DIR}}/settings/templates/specs/research.md`
   - `{{KIRO_DIR}}/settings/rules/design-principles.md` (if present)
3. Produce:
   - `research.md` for investigations/alternatives (when needed)
   - `design.md` as the reviewable design: architecture, APIs, data model, risks, rollout
4. Update `spec.json` metadata for the design phase (phase + timestamps/approvals as defined by templates).

## Output

- Summarize key design decisions and point to `design.md`.
- Next step: `$kiro-spec-tasks <feature>` (optionally run `$kiro-validate-design <feature>` first).

