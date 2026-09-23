---
name: kiro-debug
description: Investigate implementation failures using root-cause-first debugging. Use when an implementer is blocked, verification fails, or repeated remediation does not converge.
---

# kiro-debug

<background_information>
This skill is for fresh-context root cause investigation. It combines local evidence, runtime/config inspection, and external documentation or issue research when available. It is not a patch generator for guess-first debugging.
</background_information>

<instructions>
## When to Use

- Implementer reports `BLOCKED`
- Reviewer rejection repeats after remediation
- Validation fails unexpectedly
- A task appears to conflict with runtime or platform reality
- The same failure survives more than one attempted fix

Do not use this skill to speculate about fixes before gathering evidence.

## Inputs

Provide:
- Exact failure symptom or blocker statement
- Error messages, stack trace, and failing command output
- Current `git diff` or summary of uncommitted failed changes
- Task brief: what was being built
- Reviewer feedback, if the failure came from review rejection
- Relevant spec file paths (`requirements.md`, `design.md`)
- Relevant requirement/design section numbers
- Relevant `## Implementation Notes`
- Runtime or environment constraints already known

## Outputs

Return:
- `ROOT_CAUSE`
- `CATEGORY`
- `FIX_PLAN`
- `VERIFICATION`
- `NEXT_ACTION: RETRY_TASK | BLOCK_TASK | STOP_FOR_HUMAN`
- `CONFIDENCE: HIGH | MEDIUM | LOW`
- `NOTES`

Use the language specified in `spec.json`.

## Method

### 1. Read the Error Carefully
Extract:
- Exact error text
- Stack trace or failure location
- The command that produced the failure
- Whether the failure is deterministic or intermittent

### 2. Inspect Local Runtime and Repository State
Inspect the repository for local evidence:
- `package.json`, `pyproject.toml`, `go.mod`, `Makefile`, `README*`
- Build config
- `tsconfig` or equivalent language/runtime config
- Runtime-specific config
- Dependency versions and scripts
- Relevant changed files from `git diff`

### 3. Search the Web if Available
If web access is available, search:
- The exact error message
- The technology + symptom combination
- Official documentation
- Version-specific issue trackers or migration notes

Prefer:
- Official docs
- Official repos/issues
- Version-specific references
- Runtime-specific documentation

### 4. Classify the Root Cause
Use one category:
- `MISSING_DEPENDENCY`
- `RUNTIME_MISMATCH`
- `MODULE_FORMAT`
- `NATIVE_ABI`
- `CONFIG_GAP`
- `LOGIC_ERROR`
- `TASK_ORDERING_PROBLEM`
- `TASK_DECOMPOSITION_PROBLEM`
- `SPEC_CONFLICT`
- `EXTERNAL_DEPENDENCY`

### 5. Determine the Smallest Safe Next Action
Decide whether the issue can be fixed inside this repo by:
- Editing files
- Adjusting configuration
- Adding or correcting dependencies
- Restructuring code

Use `NEXT_ACTION: RETRY_TASK` when the issue is repo-fixable inside the current approved task plan.

### 6. Determine Whether the Task Plan Is Still Valid
Decide whether the current approved task plan is still safe to execute as written.

Prefer `NEXT_ACTION: STOP_FOR_HUMAN` when:
- A missing prerequisite task should exist before this one
- The current task is ordered incorrectly relative to unfinished work
- The current task boundary is wrong and should be split or merged
- The task is too large or ambiguous to fix safely inside the current implementation loop

Use `NEXT_ACTION: BLOCK_TASK` only when the current task should stop but the rest of the queue can still proceed safely.

Do not propose a brute-force code fix as a substitute for revising `tasks.md` or the approved plan.

## Critical Rule

Do not propose a multi-fix shotgun plan. Identify the root cause first, then produce the smallest plausible fix plan. If the true problem is a spec conflict or architecture problem, say so directly.

## Stop / Escalate

Use `NEXT_ACTION: STOP_FOR_HUMAN` when the blocker genuinely requires:
- Human product/requirements decision
- External credentials or inaccessible services
- Hardware or unavailable external systems
- Re-scoping due to spec/platform conflict

If the issue is fixable by repo changes inside the current task plan, do not escalate prematurely.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| “This probably just needs a quick patch” | Patch-first debugging creates rework. |
| “Let’s try a few fixes” | Multi-fix guessing hides root cause. |
| “The spec is probably wrong, I’ll adapt it” | Spec conflicts must be surfaced explicitly. |
| “The docs search is optional” | For runtime/dependency issues, docs and version issues often contain the shortest path to root cause. |

## Output Format

```md
## Debug Report
- ROOT_CAUSE: <1-2 sentence root cause>
- CATEGORY: MISSING_DEPENDENCY | RUNTIME_MISMATCH | MODULE_FORMAT | NATIVE_ABI | CONFIG_GAP | LOGIC_ERROR | TASK_ORDERING_PROBLEM | TASK_DECOMPOSITION_PROBLEM | SPEC_CONFLICT | EXTERNAL_DEPENDENCY
- FIX_PLAN:
  1. <specific repo-fixable action>
  2. <specific repo-fixable action>
- VERIFICATION: <command(s) to confirm the fix>
- NEXT_ACTION: RETRY_TASK | BLOCK_TASK | STOP_FOR_HUMAN
- CONFIDENCE: HIGH | MEDIUM | LOW
- NOTES: <context the next implementer should know>
```
</instructions>
