---
description: Create custom steering documents for specialized project contexts
agent: kiro/steering-custom
subtask: true
---

# Kiro Custom Steering Creation

## Interactive Workflow

This command starts an interactive process with the Subagent:
1. Subagent asks user for domain/topic
2. Subagent checks for available templates
3. Subagent analyzes codebase for relevant patterns
4. Subagent generates custom steering file

## Subagent Context

Interactive Mode: Ask user for domain/topic

File patterns to read:
- {{KIRO_DIR}}/settings/templates/steering-custom/*.md
- {{KIRO_DIR}}/settings/rules/steering-principles.md

JIT Strategy: Analyze codebase for relevant patterns as needed

## Display Result

Show Subagent summary to user:
- Custom steering file created
- Template used (if any)
- Codebase patterns analyzed
- Content overview

## Available Templates

Available templates in `{{KIRO_DIR}}/settings/templates/steering-custom/`:
- api-standards.md, testing.md, security.md, database.md
- error-handling.md, authentication.md, deployment.md

## Notes

- Subagent will interact with user to understand needs
- Templates are starting points, customized for project
- All steering files loaded as project memory
- Avoid documenting agent-specific tooling directories (e.g. `.cursor/`, `.gemini/`, `.claude/`)
- `{{KIRO_DIR}}/settings/` content should NOT be documented (it's metadata, not project knowledge)
- Light references to `{{KIRO_DIR}}/specs/` and `{{KIRO_DIR}}/steering/` are acceptable; avoid other `.kiro/` directories
