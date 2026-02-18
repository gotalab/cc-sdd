---
description: Manage {{KIRO_DIR}}/steering/ as persistent project knowledge
agent: steering
subtask: true
---

# Kiro Steering Management

## Mode Detection

**Perform detection before invoking Subagent**:

Check `{{KIRO_DIR}}/steering/` status:
- **Bootstrap Mode**: Empty OR missing core files (product.md, tech.md, structure.md)
- **Sync Mode**: All core files exist

Use Glob to check for existing steering files.

## Subagent Context

Mode: {bootstrap or sync based on detection}

File patterns to read:
- {{KIRO_DIR}}/steering/*.md (if sync mode)
- {{KIRO_DIR}}/settings/templates/steering/*.md
- {{KIRO_DIR}}/settings/rules/steering-principles.md

JIT Strategy: Fetch codebase files when needed, not upfront

## Display Result

Show Subagent summary to user:

### Bootstrap:
- Generated steering files: product.md, tech.md, structure.md
- Review and approve as Source of Truth

### Sync:
- Updated steering files
- Code drift warnings
- Recommendations for custom steering

## Notes

- All `{{KIRO_DIR}}/steering/*.md` loaded as project memory
- Templates and principles are external for customization
- Focus on patterns, not catalogs
- "Golden Rule": New code following patterns shouldn't require steering updates
- Avoid documenting agent-specific tooling directories (e.g. `.cursor/`, `.gemini/`, `.claude/`)
- `{{KIRO_DIR}}/settings/` content should NOT be documented in steering files (settings are metadata, not project knowledge)
- Light references to `{{KIRO_DIR}}/specs/` and `{{KIRO_DIR}}/steering/` are acceptable; avoid other `.kiro/` directories
