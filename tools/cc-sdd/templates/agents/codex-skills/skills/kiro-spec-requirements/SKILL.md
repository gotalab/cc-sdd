---
name: kiro-spec-requirements
description: Generate testable requirements (EARS) for a feature spec in {{KIRO_DIR}}/specs/<feature>/requirements.md and update spec.json metadata.
metadata:
  short-description: Generate requirements
---

# Kiro Spec Requirements

## Usage

- Invoke: `$kiro-spec-requirements <feature-name>`

## Procedure

1. Read context:
   - `{{KIRO_DIR}}/specs/<feature>/spec.json`
   - `{{KIRO_DIR}}/specs/<feature>/requirements.md` (contains the initial description)
   - All steering: `{{KIRO_DIR}}/steering/*.md`
2. Read rules/templates:
   - `{{KIRO_DIR}}/settings/rules/ears-format.md`
   - `{{KIRO_DIR}}/settings/templates/specs/requirements.md`
3. Replace the initial description with a complete, testable requirements set:
   - Use EARS format for acceptance criteria.
   - Focus on WHAT, not HOW.
   - Requirement headings must have leading numeric IDs (no alphabetic labels).
4. Update `spec.json`:
   - `phase: "requirements-generated"`
   - `approvals.requirements.generated: true`
   - `updated_at` timestamp

## Output

- Summarize key requirement areas and point to the updated files.
- Next step: `$kiro-spec-design <feature>` (optionally run `$kiro-validate-gap <feature>` first for brownfield).

