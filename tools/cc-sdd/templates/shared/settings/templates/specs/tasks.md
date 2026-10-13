# Implementation Plan

## Task Format Template

Use whichever pattern fits the work breakdown:

### Major task only
- [ ] {{NUMBER}}.{{PARALLEL_MARK}} {{TASK_DESCRIPTION}}
  - {{DETAIL_ITEM_1}} (Include details only when needed. If the task stands alone, omit bullet items.)
  - _Requirements: {{REQUIREMENT_IDS}}_

### Major + Sub-task structure
- [ ] {{MAJOR_NUMBER}}. {{MAJOR_TASK_SUMMARY}}
- [ ] {{MAJOR_NUMBER}}.{{SUB_NUMBER}}{{SUB_PARALLEL_MARK}} {{SUB_TASK_DESCRIPTION}}
  - {{DETAIL_ITEM_1}}
  - {{DETAIL_ITEM_2}}
  - {{OBSERVABLE_COMPLETION_ITEM}} (At least one detail item should state the observable completion condition for this task.)
  - _Boundary: {{COMPONENT_NAMES}}_ (Only for (P) tasks. Omit when scope is obvious.)
  - _Depends: {{TASK_IDS}}_ (Only for non-obvious cross-boundary dependencies. Most tasks omit this.)
  - _Requirements: {{REQUIREMENT_IDS}}_ (IDs only; do not add descriptions or parentheses.)

> **Parallel marker**: Insert ` (P)` immediately after the task number for tasks that can be executed in parallel. Omit the marker when running in `--sequential` mode.
>
> **Optional test coverage**: When a sub-task is deferrable test work tied to acceptance criteria, mark the checkbox as `- [ ]*` and explain the referenced requirements in the detail bullets.

## Task Hierarchy and Completion

- A major task with sub-tasks is a container, not a separate execution unit. Identify children by their numbered prefix (`1.1`, `1.2` belong to `1.`), regardless of indentation or `(P)` markers.
- A major task without sub-tasks is an executable task. Apply the same implementation, review, verification, and checkbox rules as for an executable sub-task; this also applies in mixed task lists.
- A container is complete if and only if all of its sub-tasks are `[x]`, including optional `*` sub-tasks, and none are blocked. If any child is unchecked or blocked, the container is incomplete. Do not infer child completion from a checked parent.
- Keep container checkboxes as aggregate progress indicators. After an executable task changes state, synchronize its container checkbox with the rule above. Never auto-complete a standalone major task from an empty child list.
