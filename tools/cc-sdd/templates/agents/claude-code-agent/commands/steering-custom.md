---
description: Create custom steering documents for specialized project contexts
allowed-tools: Task
---

# Kiro Custom Steering Creation

## Interactive Workflow

This command starts an interactive process with the SubAgent:
1. SubAgent asks user for domain/topic
2. SubAgent checks for available templates
3. SubAgent analyzes codebase for relevant patterns
4. SubAgent generates custom steering file

## Invoke SubAgent

Delegate custom steering creation to steering-custom-agent:

Use the Task tool to invoke the SubAgent with file path patterns:

```
Task(
  subagent_type="steering-custom-agent",
  description="Create custom steering",
  prompt="""
Interactive Mode: Ask user for domain/topic

File patterns to read:
- {{KIRO_DIR}}/settings/templates/steering-custom/*.md
- {{KIRO_DIR}}/settings/rules/steering-principles.md

JIT Strategy: Analyze codebase for relevant patterns as needed
"""
)
```

## Display Result

Show SubAgent summary to user:
- Custom steering file created
- Template used (if any)
- Codebase patterns analyzed
- Content overview

## Available Templates

Available templates in `{{KIRO_DIR}}/settings/templates/steering-custom/`:
- api-standards.md, testing.md, security.md, database.md
- error-handling.md, authentication.md, deployment.md

## Notes

- SubAgent will interact with user to understand needs
- Templates are starting points, customized for project
- All steering files loaded as project memory
