---
description: Resume work from a handoff document
allowed-tools: Read, SlashCommand, TodoWrite, Glob
argument-hint: <handoff-id>
---

# Resume from Handoff

<background_information>

- **Mission**: Resume work from a previously created handoff document
- **Success Criteria**:
  - Handoff document located and parsed correctly
  - Context restored from handoff information
  - Work continues from the specified continuation point
  - All key files and decisions reviewed before proceeding
    </background_information>

<instructions>
## Core Task

Resume work from a previously created handoff document when context threshold was exceeded.

## Execution Steps

### Step 1: Parse Handoff ID

Extract handoff ID from `$ARGUMENTS`:

- If `$ARGUMENTS` contains a timestamp-like ID (e.g., `20260224T112000`), use it directly
- If `$ARGUMENTS` is empty, list available handoffs from `{{KIRO_DIR}}/handoffs/`

Example:

```
/kiro:resume 20260224T112000
/kiro:resume  # Lists available handoffs
```

### Step 2: Locate Handoff Document

Find the handoff document at:

```
{{KIRO_DIR}}/handoffs/handoff-{id}.md
```

If not found:

- List available handoff documents
- Ask user to specify correct ID
- Exit with error if no handoffs exist

### Step 3: Parse Handoff Document

Extract the following sections from the handoff document:

**Metadata**:

- Feature name
- Context percentage at handoff
- Agent mode
- Timestamp

**Completed Work**:

- List of completed tasks
- Output locations for each task

**In-Progress Work**:

- Current task being worked on
- Next step to take
- Files being modified
- Current state details

**Remaining Work**:

- Task queue with priorities
- Dependencies between tasks

**Continuation Instructions**:

- Specific continuation point
- Reference files to follow

**Key Files**:

- Table of files to read for context
- Priority for each file

**Decisions Log**:

- Important decisions made
- Rationale for each decision

### Step 4: Display Summary

Show handoff summary to user:

```
📋 Handoff Summary

## Metadata:
- ID: {handoff-id}
- Created: {timestamp}
- Context at Handoff: {percentage}%
- Feature: {feature-name}
- Mode: {agent-mode}

## Completed Work:
- ✅ {task 1}
- ✅ {task 2}

## In-Progress:
- 🔄 {current task}
- Next: {next step}

## Remaining:
- ⏳ {task 3}
- ⏳ {task 4}

## Key Files to Read:
1. {file 1} - {purpose}
2. {file 2} - {purpose}

## Continuation Point:
{specific continuation point}
```

### Step 5: Restore Context

Read key files specified in handoff document:

1. Read files marked as "High" priority first
2. Read files marked as "Medium" priority next
3. Review decisions log for context

### Step 6: Continue Work

Execute remaining tasks from continuation point:

1. Create TodoWrite task list from remaining work
2. Continue from the specified next step
3. Follow patterns from reference files
4. Update task status as work progresses

## Handoff Document Parsing

When parsing the handoff document, look for these markdown sections:

```markdown
## Metadata

| Field | Value |
...

## Completed Work

### {Task Name}

...

## In-Progress Work

### Current Task: {task name}

...

## Remaining Work

| Priority | Task | Dependencies | Status |
...

## Continuation Instructions

...

## Key Files

| File | Purpose | Read Priority |
...

## Decisions Log

| Decision | Rationale | Impact |
...
```

## Continuation Protocol

1. **Read key files** specified in handoff (priority order)
2. **Review decisions log** to understand context
3. **Continue from** the specified continuation point
4. **Follow patterns** from reference files
5. **Update tasks** as work progresses

## Output Description

### Successful Resume

```
✅ Context Restored from Handoff

## Handoff: {id}
- Feature: {feature-name}
- Created: {timestamp}

## Context Loaded:
- {N} key files read
- {M} decisions reviewed

## Resuming Work:
- Current: {current task}
- Next Step: {next step}

## Tasks Remaining: {X}
```

### No Handoff Found

```
❌ No Handoff Found

No handoff document found with ID: {id}

## Available Handoffs:
- {id1} - {feature} ({timestamp})
- {id2} - {feature} ({timestamp})

Usage: /kiro:resume <handoff-id>
```

## Safety & Fallback

### Error Scenarios

**Handoff ID Not Provided**:

- List available handoffs
- Show usage instructions

**Handoff Document Not Found**:

- List available handoffs
- Suggest correct ID

**Malformed Handoff Document**:

- Parse what is available
- Warn about missing sections
- Continue with partial context

**Key Files Missing**:

- Warn about missing files
- Continue with available context
- Suggest manual file search

### Usage Guidance

**When to Use**:

- After context threshold exceeded
- When resuming from a previous session
- When continuing work from another agent

**Prerequisites**:

- Handoff document must exist
- Key files should be accessible
- Feature directory should exist
  </instructions>
