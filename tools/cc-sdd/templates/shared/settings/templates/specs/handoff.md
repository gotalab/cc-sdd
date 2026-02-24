# Session Handoff Document

## Metadata

- **Handoff ID**: {{HANDOFF_ID}}
- **Created**: {{TIMESTAMP}}
- **Source Session**: {{SESSION_ID}}
- **Context at Handoff**: {{CONTEXT_PERCENTAGE}}%
- **Feature**: {{FEATURE_NAME}}
- **Agent Mode**: {{claude-code-agent|opencode-agent}}

## Completed Work

### {{COMPLETED_TASK_1}}

- **Status**: Complete
- **Output Location**: {{FILE_PATH}}
- **Key Decisions**: {{DECISIONS_MADE}}
- **Validation**: {{HOW_TO_VALIDATE}}

### {{COMPLETED_TASK_2}}

- **Status**: Complete
- **Output Location**: {{FILE_PATH}}
- **Key Decisions**: {{DECISIONS_MADE}}
- **Validation**: {{HOW_TO_VALIDATE}}

## In-Progress Work

### {{IN_PROGRESS_TASK}}

- **Status**: {{PERCENTAGE}}% complete
- **Current Step**: {{CURRENT_STEP_DESCRIPTION}}
- **Next Step**: {{NEXT_STEP_DESCRIPTION}}
- **Blockers**: {{ANY_BLOCKERS}}
- **Context Needed**: {{WHAT_NEW_SUBAGENT_NEEDS_TO_KNOW}}

## Remaining Work

### Task Queue

1. {{REMAINING_TASK_1}}
   - Dependencies: {{DEPENDENCIES}}
   - Estimated complexity: {{LOW|MEDIUM|HIGH}}
2. {{REMAINING_TASK_2}}
   - Dependencies: {{DEPENDENCIES}}
   - Estimated complexity: {{LOW|MEDIUM|HIGH}}

## Continuation Instructions

### Quick Resume Command

```
/kiro:resume {{HANDOFF_ID}}
```

### What the Next Subagent Should Do

1. Read this handoff document
2. Read {{KEY_FILES_TO_READ}}
3. Continue from: {{CONTINUATION_POINT}}
4. Follow the pattern established in: {{REFERENCE_FILES}}

## Key Files

| File       | Purpose     | Status     |
| ---------- | ----------- | ---------- |
| {{FILE_1}} | {{PURPOSE}} | {{STATUS}} |
| {{FILE_2}} | {{PURPOSE}} | {{STATUS}} |

## Decisions Log

| Decision       | Rationale     | Alternatives Considered |
| -------------- | ------------- | ----------------------- |
| {{DECISION_1}} | {{RATIONALE}} | {{ALTERNATIVES}}        |

## Validation Checkpoints

- [ ] {{CHECKPOINT_1}}
- [ ] {{CHECKPOINT_2}}
- [ ] {{CHECKPOINT_3}}
