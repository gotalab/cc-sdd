---
name: kiro-spec-impl
description: Implement tasks for a feature spec following {{KIRO_DIR}}/specs/<feature>/{requirements,design,tasks}.md and repo steering; prefer tests first where applicable.
metadata:
  short-description: Implement spec tasks
---

# Kiro Spec Impl

## Usage

- Invoke: `$kiro-spec-impl <feature-name> [task-ids]`
- If task IDs are provided, implement only those. Otherwise, implement the next pending tasks from `tasks.md`.

## Procedure

1. Read:
   - `{{KIRO_DIR}}/specs/<feature>/requirements.md`
   - `{{KIRO_DIR}}/specs/<feature>/design.md`
   - `{{KIRO_DIR}}/specs/<feature>/tasks.md`
   - All steering: `{{KIRO_DIR}}/steering/*.md`
2. Implement incrementally:
   - Prefer small PR-sized changes aligned to tasks
   - Add/update tests where meaningful
   - Keep docs/templates in sync if behavior changes
3. After changes, run relevant project tests/linters (or describe how to run them if tooling isn’t available).

## Output

- List completed tasks, changed files, and how to verify.
- Recommend `$kiro-validate-impl <feature>` after implementation.

