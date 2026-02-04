---
name: kiro-validate-design
description: Validate the design ({{KIRO_DIR}}/specs/<feature>/design.md) against the existing codebase and steering rules to catch integration issues early.
metadata:
  short-description: Validate design
---

# Kiro Validate Design

## Usage

- Invoke: `$kiro-validate-design <feature-name>`

## Procedure

1. Read:
   - `{{KIRO_DIR}}/specs/<feature>/spec.json`
   - `{{KIRO_DIR}}/specs/<feature>/design.md` (and `research.md` if present)
   - All steering: `{{KIRO_DIR}}/steering/*.md`
2. Inspect the codebase for integration constraints (APIs, module boundaries, DB, auth, etc.).
3. Identify mismatches, missing migration steps, unsafe assumptions, and operational risks.
4. Propose concrete fixes to the design (do not implement code here).

## Output

- Report compatibility findings and recommended design changes.
- Next step: update `design.md` if needed, then `$kiro-spec-tasks <feature>`.

