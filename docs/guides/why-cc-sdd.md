# Why cc-sdd? A philosophy note

> English | [日本語](ja/why-cc-sdd.md)

This is the long version of "why does cc-sdd exist and what trade-off is it making". If you just want to install and try it, the project [README](../../README.md) is the faster path. Come here when you want to understand the design rationale.

## The short version

cc-sdd treats the spec as a contract between parts of the system, not a master command document to be handed to the agent. Code remains the source of truth. Specs make the contracts between parts of the code explicit, so humans and agents can work in parallel without constant synchronization.

The bet is simple. Explicit contracts at the right granularity let team-scale AI-driven development move faster, not slower. Boundaries are not overhead. They are what lets you move freely inside while protecting the outside.

## Specification vs Design

It helps to separate two things that often get collapsed together.

- **Specification**: the contract, the boundary, the pre-conditions a piece of work must respect.
- **Design**: the free exploration space *inside* that contract. Components, interfaces, implementation decisions.

cc-sdd treats this distinction as first-class:

- `requirements.md`, the File Structure Plan, and boundary annotations (`_Boundary:_`, `_Depends:_`) define the **specification**, the contract that must be respected.
- `design.md` internals, `tasks.md` sequencing, and the implementation inside each task are the **design**, free territory for the agent, bounded by the contract.

The human reviews and approves at the specification layer. The agent is free inside the design layer.

## How cc-sdd thinks about speed

The usual assumption about specs is that they slow you down. cc-sdd is built on the opposite assumption: explicit contracts at the right granularity make team-scale AI-driven development faster, not slower. Four things follow from that stance.

### Right-sized specs, not monolithic plans

A spec should be small enough to ship as a unit in hours or days. When a piece of work is too big for one spec, `/kiro-discovery` decomposes it and `/kiro-spec-batch` creates multiple specs in parallel. You ship, you learn from that slice, you move to the next one, instead of committing to one large plan up front.

### Federated ownership

Each spec has its own scope and owners. Cross-spec review catches inconsistencies between specs, so work coordinates through explicit contracts rather than through a central authority holding a master plan.

### Continuous mechanical verification

Contracts are checked by tests, linting, the independent reviewer pass, boundary checks, and `/kiro-validate-impl` throughout the work, not at a single integration step at the end.

### Agents write the spec, humans review the contract

Every phase is agent-driven. You do not author `requirements.md`, `design.md`, or `tasks.md` yourself. You will still read them at phase gates, and that review is not free. But your review is focused on contract decisions (are the boundaries right, are the responsibilities scoped correctly, are the dependencies honest), not on line-by-line behavior. At task completion, you then review the actual `git diff` against that approved contract. Phase-gate review exists so contract problems surface at review time instead of at integration time.

## Why this matters with AI agents specifically

Agents are fast. They will happily generate thousands of lines of code in parallel, across multiple modules, in a single session. The bottleneck is not capability. It is coordination.

When an agent changes module A in one spec and module B in another, and nobody has written down what the contract between A and B is, you get silent breakage that only surfaces later. This is the same pain large engineering teams have been solving for decades with explicit interfaces, contract tests, and modular boundaries. cc-sdd applies those principles to agent-authored work.

Inside a boundary, you are free to refactor, invent, and iterate. Across boundaries, you have contracts, so nobody else's work silently breaks when you move.

## When cc-sdd is the right tool

- Your work decomposes into multiple specs shipped at medium grain. Not one monolith, not individual line changes.
- Multiple humans, agents, or streams are touching the codebase, and "did your change break mine?" is starting to cost real time.
- You want to ship in small vertical slices and learn from each before committing to the next.
- You need to audit any line of agent-generated code back to an approved contract.

## When you do not need cc-sdd

- Solo work that fits in a single agent session.
- Prototype or throwaway code where writing down boundaries is overkill.
- Work where "vibe coding" is genuinely faster than making the contract explicit.

Even inside cc-sdd, `/kiro-discovery` can legitimately return *"no spec needed, implement directly"* as a valid route. cc-sdd is not trying to put a formal spec around every change, only the ones where the contract between parts of the system actually earns its cost.

> If the discipline feels like overhead, your specs are probably too big. Break them smaller.

## See also

- [Spec-Driven Development Workflow](spec-driven.md): how the ideas here are implemented as an end-to-end workflow in cc-sdd.
- [Skill Reference](skill-reference.md): the skills-mode surface, including `/kiro-impl` dispatch internals.
- [Migration Guide](migration-guide.md): if you are coming from cc-sdd v1.x or v2.x.
