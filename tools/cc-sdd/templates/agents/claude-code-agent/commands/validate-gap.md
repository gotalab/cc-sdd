---
description: Analyze implementation gap between requirements and existing codebase
allowed-tools: Read, Task
argument-hint: <feature-name>
---

# Implementation Gap Validation

## Parse Arguments
- Feature name: `$1`

## Validate
Check that requirements have been completed:
- Verify `{{KIRO_DIR}}/specs/$1/` exists
- Verify `{{KIRO_DIR}}/specs/$1/requirements.md` exists

If validation fails, inform user to complete requirements phase first.

## Invoke SubAgent

Delegate gap analysis to validate-gap-agent:

Use the Task tool to invoke the SubAgent with file path patterns:

```
Task(
  subagent_type="validate-gap-agent",
  description="Analyze implementation gap",
  prompt="""
Feature: $1
Spec directory: {{KIRO_DIR}}/specs/$1/

File patterns to read:
- {{KIRO_DIR}}/specs/$1/spec.json
- {{KIRO_DIR}}/specs/$1/requirements.md
- {{KIRO_DIR}}/steering/*.md
- {{KIRO_DIR}}/settings/rules/gap-analysis.md
"""
)
```

## Display Result

Show SubAgent summary to user, then provide next step guidance:

### Next Phase: Design Generation

**If Gap Analysis Complete**:
- Review gap analysis insights
- Run `/kiro:spec-design $1` to create technical design document
- Or `/kiro:spec-design $1 -y` to auto-approve requirements and proceed directly

**Note**: Gap analysis is optional but recommended for brownfield projects to inform design decisions.