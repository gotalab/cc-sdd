---
name: kiro-verify-completion
description: Verify completion and success claims with fresh evidence. Use before claiming a task is complete, a fix works, tests pass, or a feature is ready for GO.
---

# kiro-verify-completion

<background_information>
This skill prevents false completion claims. A task, fix, or feature is only complete when supported by fresh evidence that matches the scope of the claim.
</background_information>

<instructions>
## When to Use

- Before saying a task is complete
- Before saying a bug is fixed
- Before saying tests pass
- Before moving to the next task in autonomous execution
- Before reporting `GO` from feature-level validation
- Before trusting another subagent's success report

Do not use this skill for early planning or speculative status updates.

## Inputs

Provide:
- The exact claim to verify
- Claim type:
  - `TASK`
  - `FIX`
  - `TEST_OR_BUILD`
  - `FEATURE_GO`
- Validation commands discovered by the controller
- Fresh command output and exit codes
- Relevant task IDs, requirement IDs, and design refs where applicable
- For feature-level claims:
  - requirements coverage status
  - design alignment status
  - integration status
  - blocked task status

## Outputs

Return one of:
- `VERIFIED`
- `NOT_VERIFIED`
- `MANUAL_VERIFY_REQUIRED`

Also return:
- Claim reviewed
- Evidence used
- Scope/evidence mismatch, if any

Use the language specified in `spec.json`.

## Gate Function

1. Identify the exact claim.
2. Identify the exact command or checklist that proves that claim.
3. Require fresh evidence from the current code state.
4. Check exit code, failure count, skipped scope, and missing coverage.
5. Reject claims that are broader than the evidence.
6. If mandatory validation cannot be completed, return `MANUAL_VERIFY_REQUIRED`.
7. Only then allow the claim.

## Claim-Specific Rules

### TASK
Require:
- task-local verification evidence
- no unresolved blocking findings from review
- evidence aligned with the task boundary

### FIX
Require:
- evidence that the original symptom is resolved
- no broader regressions in the relevant verification scope

### TEST_OR_BUILD
Require:
- actual command output
- exit code
- no inference from unrelated checks

### FEATURE_GO
Require:
- full test suite result
- runtime smoke boot result showing the built artifact reaches its first usable state
- requirements coverage assessment
- cross-task integration assessment
- design end-to-end alignment assessment
- blocked tasks assessment

A passing test suite alone is not enough for `FEATURE_GO`.

## Stop / Escalate

Return `MANUAL_VERIFY_REQUIRED` when:
- No canonical validation command is known
- The required environment is unavailable
- A mandatory manual verification step cannot be executed

Return `NOT_VERIFIED` when:
- The command failed
- Evidence is stale
- Evidence is partial
- The claim exceeds the evidence
- The feature still has unresolved blocked tasks or uncovered requirements

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| “The subagent said it succeeded” | Reported success is not verification evidence. |
| “Tests passed earlier” | Fresh evidence only. |
| “Build should be fine because lint passed” | Lint does not prove build success. |
| “Tests passed and build succeeded, so it must run” | Type erasure, module loading, native ABI, and boot-time config issues can still fail at runtime. |
| “The feature is done because all tasks are checked off” | `FEATURE_GO` also requires coverage, integration, and design alignment. |

## Output Format

```md
## Verification Result
- STATUS: VERIFIED | NOT_VERIFIED | MANUAL_VERIFY_REQUIRED
- CLAIM_TYPE: TASK | FIX | TEST_OR_BUILD | FEATURE_GO
- CLAIM: <exact claim>
- EVIDENCE: <command/checklist and result>
- GAPS: <scope/evidence mismatch or missing validation>
- NOTES: <next action if not verified>
```
</instructions>
