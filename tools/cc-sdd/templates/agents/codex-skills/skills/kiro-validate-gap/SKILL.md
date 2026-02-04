---
name: kiro-validate-gap
description: Analyze the implementation gap between {{KIRO_DIR}}/specs/<feature>/requirements.md and the existing codebase, following {{KIRO_DIR}}/settings/rules/gap-analysis.md.
metadata:
  short-description: Validate gap
---

# Kiro Validate Gap

## Usage

- Invoke: `$kiro-validate-gap <feature-name>`

## Procedure

1. Read context:
   - `{{KIRO_DIR}}/specs/<feature>/spec.json`
   - `{{KIRO_DIR}}/specs/<feature>/requirements.md`
   - All steering: `{{KIRO_DIR}}/steering/*.md`
2. Read analysis framework:
   - `{{KIRO_DIR}}/settings/rules/gap-analysis.md`
3. Inspect the codebase (search + read) to identify:
   - Existing components/services that already meet requirements
   - Missing capabilities and integration points
   - Viable approaches (extend vs new vs hybrid) and trade-offs
   - Research needed for design phase

## Output

- Produce a concise summary plus a structured gap analysis per `gap-analysis.md`.
- Next step: `$kiro-spec-design <feature>`.

