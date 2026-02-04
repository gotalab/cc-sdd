---
name: kiro-steering-custom
description: Add a custom steering document under {{KIRO_DIR}}/steering/ for domain-specific rules (APIs, security, testing, naming, etc.).
metadata:
  short-description: Create custom steering
---

# Kiro Steering Custom

## Usage

- Invoke: `$kiro-steering-custom <what-to-create>`
- If the request is unclear, propose 2–3 candidate steering docs and ask which to create.

## Procedure

1. Read existing steering: `{{KIRO_DIR}}/steering/*.md`.
2. Choose a filename and scope (e.g., `api-standards.md`, `security.md`, `testing.md`).
3. Use `{{KIRO_DIR}}/settings/templates/steering/` as structure guide when applicable.
4. Write the new steering doc with concrete, enforceable rules and examples.

## Output

- Confirm the created file path and how it affects future specs/implementation.

