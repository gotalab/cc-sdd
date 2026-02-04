---
name: kiro-spec-init
description: Initialize a new spec under {{KIRO_DIR}}/specs/ from a project description (creates spec.json and requirements.md seed).
metadata:
  short-description: Initialize a spec
---

# Kiro Spec Init

## Usage

- Invoke: `$kiro-spec-init <what-to-build>`
- Input is the text after the skill name. If missing/too vague, ask 1–3 clarifying questions.

## Procedure

1. Check existing specs in `{{KIRO_DIR}}/specs/` to avoid name collisions.
2. Generate a short, URL-safe feature name (kebab-case). If it already exists, append `-2`, `-3`, etc.
3. Create `{{KIRO_DIR}}/specs/<feature>/`.
4. Read templates:
   - `{{KIRO_DIR}}/settings/templates/specs/init.json`
   - `{{KIRO_DIR}}/settings/templates/specs/requirements-init.md`
5. Replace placeholders:
   - `{{FEATURE_NAME}}`, `{{TIMESTAMP}}` (ISO 8601), `{{PROJECT_DESCRIPTION}}`
6. Write:
   - `{{KIRO_DIR}}/specs/<feature>/spec.json`
   - `{{KIRO_DIR}}/specs/<feature>/requirements.md`

## Output

- Confirm created paths.
- Provide the next command: `$kiro-spec-requirements <feature>`.

