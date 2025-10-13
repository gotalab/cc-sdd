---
description: Validate implementation against requirements, design, and tasks
allowed-tools: Read, Task
argument-hint: [feature-name] [task-numbers]
---

# Implementation Validation

## Parse Arguments
- Feature name: `$1` (optional)
- Task numbers: `$2` (optional)

## Auto-Detection Logic

**Perform detection before invoking SubAgent**:

**If no arguments** (`$1` empty):
- Parse conversation history for `/kiro:spec-impl <feature> [tasks]` patterns
- OR scan `{{KIRO_DIR}}/specs/*/tasks.md` for `[x]` checkboxes
- Pass detected features and tasks to SubAgent

**If feature only** (`$1` present, `$2` empty):
- Read `{{KIRO_DIR}}/specs/$1/tasks.md` and find all `[x]` checkboxes
- Pass feature and detected tasks to SubAgent

**If both provided** (`$1` and `$2` present):
- Pass directly to SubAgent without detection

## Invoke SubAgent

Delegate validation to validate-impl-agent:

Use the Task tool to invoke the SubAgent with file path patterns:

```
Task(
  subagent_type="validate-impl-agent",
  description="Validate implementation",
  prompt="""
Feature: {$1 or auto-detected}
Target tasks: {$2 or auto-detected}
Mode: {auto-detect, feature-all, or explicit}

File patterns to read:
- {{KIRO_DIR}}/specs/{feature}/*.{json,md}
- {{KIRO_DIR}}/steering/*.md

Validation scope: {based on detection results}
"""
)
```

## Display Result

Show SubAgent summary to user, then provide next step guidance:

### Next Steps Guidance

**If GO Decision**:
- Implementation validated and ready
- Proceed to deployment or next feature

**If NO-GO Decision**:
- Address critical issues listed
- Re-run `/kiro:spec-impl <feature> [tasks]` for fixes
- Re-validate with `/kiro:validate-impl [feature] [tasks]`

**Note**: Validation is recommended after implementation to ensure spec alignment and quality.
