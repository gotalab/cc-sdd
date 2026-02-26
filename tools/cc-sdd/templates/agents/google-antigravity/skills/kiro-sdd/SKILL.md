---
name: kiro-sdd
description: Guide for Spec-Driven Development (SDD) using Kiro on AI-DLC
---
# Spec-Driven Development (SDD)

This skill enables the agent to autonomously discover and utilize the Kiro Spec-Driven Development workflow.

## Overview
Kiro-style Spec Driven Development implementation on AI-DLC (AI Development Life Cycle)

## Commands Available
- `/kiro-spec-init <what-to-build>`: Initialize a new specification.
- `/kiro-spec-requirements <feature>`: Generate requirements.
- `/kiro-spec-design <feature>`: Generate technical design.
- `/kiro-spec-tasks <feature>`: Generate implementation tasks.
- `/kiro-spec-impl <feature>`: Execute implementation tasks.
- `/kiro-spec-status <feature>`: Check specification progress.
- `/kiro-steering`: Manage project steering files.
- `/kiro-steering-custom`: Create custom steering files.

## Workflow
1. Initialize spec: `/kiro-spec-init`
2. Define requirements: `/kiro-spec-requirements`
3. Design: `/kiro-spec-design`
4. Tasks: `/kiro-spec-tasks`
5. Implementation: `/kiro-spec-impl`

Always verify alignment with steering context in `{{KIRO_DIR}}/steering/`.
