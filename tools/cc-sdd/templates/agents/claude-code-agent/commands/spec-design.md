---
description: Create comprehensive technical design for a specification
allowed-tools: Read, Task
argument-hint: <feature-name> [-y]
---

# Technical Design Generator

## Parse Arguments
- Feature name: `$1`
- Auto-approve flag: `$2` (optional, "-y")

## Validate
Check that requirements have been completed:
- Verify `{{KIRO_DIR}}/specs/$1/` exists
- Verify `{{KIRO_DIR}}/specs/$1/requirements.md` exists

If validation fails, inform user to complete requirements phase first.

## Invoke SubAgent

Delegate design generation to spec-design-agent:

Use the Task tool to invoke the SubAgent with file path patterns:

```
Task(
  subagent_type="spec-design-agent",
  description="Generate technical design",
  prompt="""
Feature: $1
Spec directory: {{KIRO_DIR}}/specs/$1/
Auto-approve: {true if $2 == "-y", else false}

File patterns to read:
- {{KIRO_DIR}}/specs/$1/*.{json,md}
- {{KIRO_DIR}}/steering/*.md
- {{KIRO_DIR}}/settings/rules/design-*.md
- {{KIRO_DIR}}/settings/templates/specs/design.md

Discovery: auto-detect based on requirements
Mode: {generate or merge based on design.md existence}
"""
)
```

## Display Result

Show SubAgent summary to user, then provide next step guidance:

### Next Phase: Task Generation

**If Design Approved**:
- Review generated design at `{{KIRO_DIR}}/specs/$1/design.md`
- **Optional**: Run `/kiro:validate-design $1` for interactive quality review
- Then `/kiro:spec-tasks $1 -y` to generate implementation tasks

**If Modifications Needed**:
- Provide feedback and re-run `/kiro:spec-design $1`
- Existing design used as reference (merge mode)

**Note**: Design approval is mandatory before proceeding to task generation.