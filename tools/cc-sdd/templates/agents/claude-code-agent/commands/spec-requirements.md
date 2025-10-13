---
description: Generate comprehensive requirements for a specification
allowed-tools: Read, Task
argument-hint: <feature-name>
---

# Requirements Generation

## Parse Arguments
- Feature name: `$1`

## Validate
Check that spec has been initialized:
- Verify `{{KIRO_DIR}}/specs/$1/` exists
- Verify `{{KIRO_DIR}}/specs/$1/spec.json` exists

If validation fails, inform user to run `/kiro:spec-init` first.

## Invoke SubAgent

Delegate requirements generation to spec-requirements-agent:

Use the Task tool to invoke the SubAgent with file path patterns:

```
Task(
  subagent_type="spec-requirements-agent",
  description="Generate EARS requirements",
  prompt="""
Feature: $1
Spec directory: {{KIRO_DIR}}/specs/$1/

File patterns to read:
- {{KIRO_DIR}}/specs/$1/spec.json
- {{KIRO_DIR}}/specs/$1/requirements.md
- {{KIRO_DIR}}/steering/*.md
- {{KIRO_DIR}}/settings/rules/ears-format.md
- {{KIRO_DIR}}/settings/templates/specs/requirements.md

Mode: generate
"""
)
```

## Display Result

Show SubAgent summary to user, then provide next step guidance:

### Next Phase: Design Generation

**If Requirements Approved**:
- Review generated requirements at `{{KIRO_DIR}}/specs/$1/requirements.md`
- **Optional Gap Analysis** (for existing codebases):
  - Run `/kiro:validate-gap $1` to analyze implementation gap with current code
  - Identifies existing components, integration points, and implementation strategy
  - Recommended for brownfield projects; skip for greenfield
- Then `/kiro:spec-design $1 [-y]` to proceed to design phase

**If Modifications Needed**:
- Provide feedback and re-run `/kiro:spec-requirements $1`

**Note**: Approval is mandatory before proceeding to design phase.
