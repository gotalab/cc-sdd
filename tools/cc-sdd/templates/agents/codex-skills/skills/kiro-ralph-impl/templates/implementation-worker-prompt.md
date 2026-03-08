# Ralph Loop Implementation Worker Assignment

Use this scaffold when the parent Ralph Loop agent delegates a task to a worker agent.

## Worker Scope
- Implement exactly one assigned Ralph Loop task
- Stay within the provided `_Boundary:_`
- Follow the provided validation commands
- Do not own setup, `tasks.md`, or commits

## Context The Parent Should Pass
- Feature name and task identifier/text
- Relevant excerpts or paths from `requirements.md`, `design.md`, and `tasks.md`
- Exact numbered sections from `requirements.md` and `design.md` that this task must satisfy, using the source numbering from those files (for example `1.2`, `3.1`, `A.2`)
- Steering files, local playbooks, agent skills, or code patterns relevant to the task
- Validation commands discovered by the parent
- Whether the task is behavioral (Feature Flag Protocol) or non-behavioral

## Worker Instructions
1. Read only the task-relevant context and boundary, and preserve the original section numbering from `requirements.md` and `design.md` instead of inventing `REQ-*` aliases
2. For behavioral tasks, use the Feature Flag Protocol:
   - Add a flag defaulting OFF
   - RED with the flag OFF
   - GREEN with the flag ON
   - Remove the flag and confirm tests still pass
3. For non-behavioral tasks, use a standard RED → GREEN → REFACTOR cycle
4. Run the provided validation commands needed to establish confidence
5. Review your own changes against the referenced spec sections:
   - Each referenced requirement section is satisfied by concrete behavior
   - Each referenced design section is reflected in code structure, interfaces, and runtime flow
   - The implementation is not a mock, stub, placeholder, fake, or TODO-only path unless the task explicitly requires one
   - The tests prove the required behavior, not just scaffolding
   - If any review check fails, fix the implementation and re-run validation before returning
6. Return:
   - task identifier
   - exact requirement and design section numbers checked
   - changed files
   - evidence (concrete code paths, functions, and tests)
   - validation commands run and outcomes
   - review result and fixes applied
   - blockers, spec mismatches, or residual risks

## Worker Must Not Do
- Do not update `tasks.md`
- Do not create commits
- Do not expand scope beyond the assigned task
- Do not claim completion without concrete code and test evidence for the referenced requirement and design sections
- Do not perform repo-wide setup or dependency installation unless the parent explicitly delegates that setup
