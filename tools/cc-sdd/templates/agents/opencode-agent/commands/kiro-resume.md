---
description: Resume work from a handoff document
allowed-tools: Read, SlashCommand, TodoWrite
argument-hint: <handoff-id>
---

# Resume from Handoff

## Core Task

Resume work from a previously created handoff document.

## Execution Steps

### Step 1: Parse Handoff ID

Extract handoff ID from `$ARGUMENTS`:

- If no ID provided, list available handoffs from `{{KIRO_DIR}}/handoffs/`
- If ID provided, locate the specific handoff document

### Step 2: Locate Handoff Document

Find the handoff document at:

- `{{KIRO_DIR}}/handoffs/handoff-{id}.md`

If not found, search for partial matches or list available handoffs.

### Step 3: Parse Handoff Document

Extract the following sections from the handoff document:

- **Metadata**: Feature name, context at handoff, agent mode
- **Completed Work**: List of completed tasks with output locations
- **In-Progress Work**: Current task and next step
- **Remaining Work**: Task queue with dependencies
- **Continuation Instructions**: What the next subagent should do
- **Key Files**: Files to read for context

### Step 4: Display Summary

Show the user a summary of:

1. What was completed before handoff
2. What was in progress
3. What remains to be done
4. The continuation point

### Step 5: Continue Work

Execute remaining tasks from continuation point:

1. **Read Key Files**: Load files specified in handoff for context
2. **Review Decisions Log**: Understand previous decisions
3. **Continue from Continuation Point**: Execute the specified next step
4. **Follow Patterns**: Use reference files for consistency

## Handoff Document Parsing

When parsing the handoff document, look for these sections:

```markdown
# Handoff Document

## Metadata

- **ID**: {timestamp}
- **Feature**: {feature-name}
- **Context at Handoff**: {percentage}%
- **Agent Mode**: {mode}

## Completed Work

- [x] Task 1: {description}
- [x] Task 2: {description}

## In-Progress Work

- [ ] Task 3: {description} (NEXT STEP: {specific action})

## Remaining Work

- [ ] Task 4: {description}
- [ ] Task 5: {description}

## Continuation Instructions

{specific instructions for next agent}

## Key Files

| File         | Purpose     |
| ------------ | ----------- |
| path/to/file | description |

## Decisions Log

- Decision 1: {description}
- Decision 2: {description}
```

## Continuation Protocol

1. **Initialize TodoWrite** with remaining tasks from handoff
2. **Read key files** to restore context
3. **Execute continuation instructions** from handoff
4. **Follow patterns** from reference files mentioned in handoff
5. **Continue monitoring context** and create new handoff if needed

## Output Description

### Handoff Summary

```
📋 Handoff Summary: {handoff-id}

## Completed ({X} tasks):
- ✅ Task 1: {description}
- ✅ Task 2: {description}

## In Progress:
- 🔄 Task 3: {description}
  - Next Step: {specific action}

## Remaining ({Y} tasks):
- ⏳ Task 4: {description}
- ⏳ Task 5: {description}

## Context at Handoff: {percentage}%
## Feature: {feature-name}

---

Resuming work from continuation point...
```

## Safety & Fallback

### Error Scenarios

**Handoff Not Found**:

- List available handoffs in `{{KIRO_DIR}}/handoffs/`
- Suggest: "Use `/kiro-resume {id}` with one of the available IDs"

**Incomplete Handoff Document**:

- Parse what is available
- Warn user about missing sections
- Proceed with best-effort continuation

**Key Files Missing**:

- Warn user about missing context files
- Suggest manual context gathering
- Proceed with available information

**No Remaining Work**:

- Report that all tasks were completed
- Suggest running `/kiro-spec-status {feature}` to verify

### Usage Guidance

**When to use**:

- After receiving a handoff message from a previous session
- When context threshold was exceeded during a workflow
- To continue interrupted work

**Related commands**:

- `/kiro-spec-status {feature}` - Check current spec status
- `/kiro-spec-quick {feature}` - Start new quick spec generation
