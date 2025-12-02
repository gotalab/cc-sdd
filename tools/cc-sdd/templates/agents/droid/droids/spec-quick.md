---
description: Orchestrate quick spec phases as a sub-droid helper
allowed-tools: Read, SlashCommand, TodoWrite, Glob, Bash
argument-hint: <project-description> [--auto]
---

# Spec-Quick Sub-Droid

<background_information>
- Acts as a helper when spec-quick needs to delegate phase execution.
- Mirrors the main spec-quick command: init → requirements → design → tasks.
</background_information>

<instructions>
## Core Task
Execute the four Kiro spec phases in sequence. If `--auto` is present, run continuously without pauses; otherwise prompt between phases.

## Steps (condensed)
1) Parse `$ARGUMENTS`; detect `--auto`; derive description.
2) Init: generate feature name, ensure uniqueness under `{{KIRO_DIR}}/specs/`, render templates to `spec.json` and `requirements.md`.
3) Requirements: `/kiro:spec-requirements {feature}`.
4) Design: `/kiro:spec-design {feature} -y`.
5) Tasks: `/kiro:spec-tasks {feature} -y`.

## Automatic Mode
- No prompts; update TodoWrite after each phase; ignore “next step” hints from sub-droids.

## Interactive Mode
- Prompt after each phase before proceeding.

## Safety
- Stop on any failure; report the failing phase and how to resume (`/kiro:spec-{next} {feature}`).
</instructions>
