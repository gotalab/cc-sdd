# Design Review Gate

Before writing `design.md`, review the draft design and repair local issues until the design passes or a true spec gap is discovered.

## Requirements Coverage Review

- Every numeric requirement ID from `requirements.md` must appear in the design traceability mapping and be backed by one or more concrete components, contracts, flows, data models, or operational decisions.
- Every requirement that introduces an external dependency, integration point, runtime prerequisite, migration concern, observability need, security constraint, or performance target must be reflected explicitly in `design.md`.
- If coverage is missing because the design draft is incomplete, repair the draft and review again.
- If coverage cannot be completed cleanly because requirements are ambiguous, contradictory, or underspecified, stop and return to the requirements phase instead of inventing design detail.

## Architecture Readiness Review

- Component boundaries must be explicit enough that implementation tasks can be assigned without guessing ownership.
- Interfaces, contracts, state transitions, and integration boundaries must be concrete enough for implementation and validation.
- Build-vs-adopt decisions that materially affect architecture must be captured in `design.md`, with deeper investigation left in `research.md` when present.
- Runtime prerequisites, migrations, rollout constraints, validation hooks, and failure modes must be surfaced when they materially affect implementation order or risk.

## Executability Review

- The design must be implementable as a sequence of bounded tasks without hidden prerequisites.
- Parallel-safe boundaries should be visible where the architecture intends concurrent implementation.
- Avoid speculative abstraction: remove components, adapters, or interfaces that exist only for hypothetical future scope.
- If a section is too vague for tasks to reference directly, rewrite it before finalizing the design.

## Review Loop

- Run this review gate on the design draft before writing `design.md`.
- If issues are local to the draft, repair the draft and re-run the review gate.
- Keep the loop bounded: no more than 2 review-and-repair passes before escalating a real spec gap.
- Write `design.md` only after the review gate passes.
