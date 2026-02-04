---
name: kiro-spec-tasks
description: Break an approved design into executable implementation tasks in {{KIRO_DIR}}/specs/<feature>/tasks.md with dependencies and parallelizable work.
metadata:
  short-description: Plan tasks
---

# Kiro Spec Tasks

## Usage

- Invoke: `$kiro-spec-tasks <feature-name>`

## Procedure

1. Read:
   - `{{KIRO_DIR}}/specs/<feature>/spec.json`
   - `{{KIRO_DIR}}/specs/<feature>/requirements.md`
   - `{{KIRO_DIR}}/specs/<feature>/design.md` (and `research.md` if present)
   - All steering: `{{KIRO_DIR}}/steering/*.md`
2. Read templates/rules:
   - `{{KIRO_DIR}}/settings/templates/specs/tasks.md`
   - `{{KIRO_DIR}}/settings/rules/tasks-parallel-analysis.md`
3. Generate `tasks.md`:
   - Small, verifiable tasks with clear acceptance criteria
   - Explicit dependencies
   - Mark parallelizable tasks per rules
4. Update `spec.json` metadata for the tasks phase.

## Output

- Summarize the plan (task count, key milestones) and point to `tasks.md`.
- Next step: `$kiro-spec-impl <feature> [tasks]`.

