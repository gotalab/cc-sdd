---
name: kiro-spec-status
description: Summarize the current status of a feature spec by reading {{KIRO_DIR}}/specs/<feature>/spec.json and related artifacts.
metadata:
  short-description: Show spec status
---

# Kiro Spec Status

## Usage

- Invoke: `$kiro-spec-status <feature-name>`

## Procedure

1. Read `{{KIRO_DIR}}/specs/<feature>/spec.json`.
2. Inspect presence/contents of:
   - `requirements.md`, `design.md`, `research.md`, `tasks.md`
3. Produce a short status summary:
   - Current phase
   - What’s approved vs pending
   - Suggested next command

