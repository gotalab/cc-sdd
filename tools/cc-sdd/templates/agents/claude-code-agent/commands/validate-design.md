---
description: Interactive technical design quality review and validation
allowed-tools: Read, Task
argument-hint: <feature-name>
---

# Technical Design Validation

## Parse Arguments
- Feature name: `$1`

## Validate
Check that design has been completed:
- Verify `{{KIRO_DIR}}/specs/$1/` exists
- Verify `{{KIRO_DIR}}/specs/$1/design.md` exists

If validation fails, inform user to complete design phase first.

## Invoke SubAgent

Delegate design validation to validate-design-agent:

Use the Task tool to invoke the SubAgent with file path patterns:

```
Task(
  subagent_type="validate-design-agent",
  description="Interactive design review",
  prompt="""
Feature: $1
Spec directory: {{KIRO_DIR}}/specs/$1/

File patterns to read:
- {{KIRO_DIR}}/specs/$1/spec.json
- {{KIRO_DIR}}/specs/$1/requirements.md
- {{KIRO_DIR}}/specs/$1/design.md
- {{KIRO_DIR}}/steering/*.md
- {{KIRO_DIR}}/settings/rules/design-review.md
"""
)
```

## Display Result

Show SubAgent summary to user, then provide next step guidance:

### Next Phase: Task Generation

**If Design Passes Validation (GO Decision)**:
- Review feedback and apply changes if needed
- Run `/kiro:spec-tasks $1` to generate implementation tasks
- Or `/kiro:spec-tasks $1 -y` to auto-approve and proceed directly

**If Design Needs Revision (NO-GO Decision)**:
- Address critical issues identified
- Re-run `/kiro:spec-design $1` with improvements
- Re-validate with `/kiro:validate-design $1`

**Note**: Design validation is recommended but optional. Quality review helps catch issues early.