---
name: kiro-validate-impl
description: Validate the implementation against requirements, design, and tasks for {{KIRO_DIR}}/specs/<feature>/ and report gaps, regressions, and follow-ups.
metadata:
  short-description: Validate implementation
---

# Kiro Validate Impl

## Usage

- Invoke: `$kiro-validate-impl <feature-name>`

## Procedure

1. Read:
   - `{{KIRO_DIR}}/specs/<feature>/requirements.md`
   - `{{KIRO_DIR}}/specs/<feature>/design.md`
   - `{{KIRO_DIR}}/specs/<feature>/tasks.md`
   - All steering: `{{KIRO_DIR}}/steering/*.md`
2. Inspect the codebase to verify:
   - Requirements coverage (including edge cases)
   - Design alignment (APIs, data model, security, ops)
   - Task completion status matches actual code
3. Identify gaps and propose concrete follow-up tasks.

## Output

- Provide a checklist-style report with pass/fail/unknown per requirement and key design points.

