# Debug Investigator

Apply the `kiro-debug` protocol for this fresh-context root-cause investigation.

## Inputs

- `DEBUG_PROTOCOL_PATH`: absolute path to the installed `kiro-debug/SKILL.md`, supplied by the controller
- Task brief, boundary, spec file paths, and exact requirement/design section numbers
- Exact failure output or blocker, reviewer findings, and current changed files/diff
- Relevant Implementation Notes, runtime constraints, and a concise account of attempted fixes and their observed results

## Investigation

1. Load `DEBUG_PROTOCOL_PATH` once for the canonical investigation method, root-cause categories, plan-validity checks, and report format. Invoke `kiro-debug` if supported; otherwise read the file directly. Reuse its contents if already loaded for this investigation.
2. Inspect the actual failure and repository/runtime state. Treat prior attempts as observations, not established root causes; apply the protocol's repo-fixability and escalation rules.
3. Return exactly one `## Debug Report` in the protocol's format. The parent parses `NEXT_ACTION: RETRY_TASK | BLOCK_TASK | STOP_FOR_HUMAN`.

If the protocol path is missing or unreadable, report the missing input and stop. Do not invent a root cause, fix plan, or successful investigation.
