# Spec-Driven Development Workflow

> 📖 **日本語ガイドはこちら:** [仕様駆動開発ガイド (日本語)](ja/spec-driven.md)

This document explains how cc-sdd implements Spec-Driven Development (SDD) inside an agentic SDLC workflow. Use it as a reference when deciding which slash command to run, what artifact to review, and how to adapt the workflow to your team.

## Core Ideas

cc-sdd treats Spec-Driven Development as a practical way to make intent, boundaries, and validation legible to both humans and agents. The goal is not to produce larger documents. The goal is to create specs that let work move independently without losing architectural coherence.

### Boundary-First by Default

In cc-sdd, the primary value of a spec is that it makes responsibility boundaries and contracts explicit.

A good spec should make it clear:

- what this spec owns
- what it explicitly does not own
- which dependencies are allowed
- what downstream work may need revalidation if this spec changes

This is why cc-sdd carries boundary thinking across the workflow:

- discovery surfaces **Boundary Candidates**
- requirements clarify boundary context where needed
- design fixes them as **Boundary Commitments**
- tasks record their local **_Boundary:_**
- review and validation look for **Boundary Violations**

### Specs as Units of Independent Delivery

cc-sdd treats a spec as more than a planning artifact. A spec is also a delivery and revalidation unit.

The practical goal is to let work progress asynchronously:

- one spec can move ahead while another waits
- downstream work can continue as long as contracts remain stable
- upstream fixes can trigger targeted revalidation instead of forcing broad resynchronization

This is why discovery, mixed decomposition, spec batch generation, and status reporting all exist. They help split work into units that can be reasoned about, reviewed, implemented, and revalidated independently.

### Architecture Is a Prerequisite

Boundary-first Spec-Driven Development only works when the underlying architecture is good enough to support it.

If a system has vague ownership, shared responsibilities, circular dependencies, or poorly defined seams, writing more specs will not create independence. It will only document confusion.

cc-sdd therefore treats architecture as a prerequisite, not an afterthought. Specs do not replace architecture. They make architecture operational by turning boundaries, dependencies, and invariants into everyday working artifacts.

### Spec-Centered, Mechanically Grounded

cc-sdd is intentionally spec-centered. Markdown specs are the primary working artifact for intent, scope, boundaries, exclusions, and revalidation conditions.

That does not reduce the importance of mechanical validation. Tests, builds, linting, type checks, and runtime smoke checks remain essential. They provide the grounding that keeps specs honest in practice.

In cc-sdd, these two layers are complementary:

- specs express intent and boundaries
- mechanical checks provide execution-level grounding

### Change-Friendly by Design

cc-sdd is designed to stay simple enough to change.

This applies at two levels:

- specs should be easy to revise as understanding improves
- cc-sdd itself should be easy for teams to adapt

Templates, rules, and skill workflows are meant to be customized. The goal is not to force one canonical workflow on every team. The goal is to preserve clear boundaries and validation loops while allowing teams to evolve the process around their own structure and delivery model.

### Long-Running Autonomy Depends on the Spec Harness

Long-running autonomy in cc-sdd is grounded in the workflow around `tasks.md`.

`/kiro-impl` can execute tasks one by one through TDD, task-local review, and bounded remediation until the final task is complete. It keeps moving when the spec, task boundary, and validation expectations are clear. It stops when human clarification, approval, or judgment is genuinely required.

Autonomy is therefore not a replacement for specs. It depends on a strong spec harness.

## Start Here

Use this table when you are deciding how to enter the workflow, not which skill name to memorize.

| You want to... | Skills mode | Legacy mode |
| --- | --- | --- |
| Start new work (feature to initiative) | `/kiro-discovery` → `/kiro-spec-init` → `/kiro-spec-requirements` → `/kiro-spec-design` → `/kiro-spec-tasks` → `/kiro-impl` | `/kiro:spec-init` → `/kiro:spec-requirements` → `/kiro:spec-design` → `/kiro:spec-tasks` → `/kiro:spec-impl` |
| Extend an existing system | `/kiro:steering` → `/kiro-discovery` or `/kiro:spec-init` → optional `/kiro:validate-gap` → `/kiro-spec-design` → `/kiro-spec-tasks` → `/kiro-impl` | `/kiro:steering` → `/kiro:spec-init` → optional `/kiro:validate-gap` → `/kiro:spec-design` → `/kiro:spec-tasks` → `/kiro:spec-impl` |
| Break down a large initiative | `/kiro-discovery` → `/kiro-spec-batch` | Not available |
| Implement a small change with no spec | `/kiro-discovery` → implement directly | Implement directly |

## Lifecycle Overview

0. **Discovery (Entry Point)** – `/kiro-discovery` (skills mode only) is the recommended entry point for new work, especially for first-time users. It routes the request into one of five outcomes: extend an existing spec, implement directly with no spec, create one new spec, decompose the work into multiple specs, or use a mixed decomposition that separates existing-spec updates, new specs, and direct-implementation candidates. For new single-spec, multi-spec, or mixed work it writes `brief.md` and, when needed, `roadmap.md`, so you can resume without re-explaining the work.
1. **Steering (Context Capture)** – `/kiro:steering` and `/kiro:steering-custom` gather architecture, conventions, and domain knowledge into steering docs.
2. **Spec Initiation** – `/kiro:spec-init <feature>` creates the feature workspace (`.kiro/specs/<feature>/`).
3. **Requirements** – `/kiro:spec-requirements <feature>` collects clarifications and produces `requirements.md`.
4. **Design** – `/kiro:spec-design <feature>` first emits/updates `research.md` with investigation notes (skipped when no research is needed), then yields `design.md` for human approval. In 3.0, `design.md` also includes a **File Structure Plan** section that maps directory structure and file responsibilities.
5. **Task Planning** – `/kiro:spec-tasks <feature>` creates `tasks.md`, mapping deliverables to implementable chunks and tagging each wave with `P0`, `P1`, etc. so teams know which tasks can run in parallel.
6. **Implementation** – `/kiro:spec-impl <feature> <task-ids>` drives execution and validation. In skills mode, `/kiro-impl` replaces this command and supports both autonomous mode (subagent dispatch per task) and manual mode (TDD in main context). See the Skills Workflow section below.
7. **Quality Gates** – optional `/kiro:validate-gap` and `/kiro:validate-design` commands compare requirements/design against existing code before implementation.
8. **Validation** – `/kiro:validate-impl` verifies implementation quality. In skills mode, this command focuses on **integration validation** across tasks rather than per-task checks.
9. **Status Tracking** – `/kiro:spec-status <feature>` summarises progress and approvals.

> Need everything in one pass? `/kiro:spec-quick <feature>` orchestrates steps 2–5 with Subagent support, pausing for approval after each phase so you can refine the generated documents.

Each phase pauses for human review unless you explicitly bypass it (for example by passing `-y` or the CLI `--auto` flag). Because Spec-Driven Development relies on these gates for quality control, keep manual approvals in place for production work and only use auto-approval in tightly controlled experiments. Teams can embed their review checklists in the template files so that each gate reflects local quality standards.

## Command → Artifact Map

| Command | Purpose | Primary Artefact(s) |
|---------|---------|---------------------|
| `/kiro:steering` | Build / refresh project memory | `.kiro/steering/*.md`
| `/kiro:steering-custom` | Add domain-specific steering | `.kiro/steering/custom/*.md`
| `/kiro:spec-init <feature>` | Start a new feature | `.kiro/specs/<feature>/`
| `/kiro:spec-requirements <feature>` | Capture requirements & gaps | `requirements.md`
| `/kiro:spec-design <feature>` | Produce investigation log + implementation design | `research.md` (when needed), `design.md`
| `/kiro:spec-tasks <feature>` | Break design into tasks with parallel waves | `tasks.md` (with P-labels)
| `/kiro:spec-impl <feature> <task-ids>` | Implement specific tasks | Code + task updates
| `/kiro:validate-gap <feature>` | Optional gap analysis vs existing code | `gap-report.md`
| `/kiro:validate-design <feature>` | Optional design validation | `design-validation.md`
| `/kiro:spec-status <feature>` | See phase, approvals, open tasks | CLI summary

## Customising the Workflow

- **Templates** – adjust `{{KIRO_DIR}}/settings/templates/{requirements,design,tasks}.md` to mirror your review process. cc-sdd copies these into every spec.
- **Approvals** – embed checklists or required sign-offs in template headers. Agents will surface them during each phase.
- **Artifacts** – extend templates with additional sections (risk logs, test plans, etc.) to make the generated documents match company standards.

## New vs Existing Projects

- **Greenfield** – if you already have project-wide guardrails, capture them via `/kiro:steering` (and `/kiro:steering-custom`) first; otherwise start with `/kiro:spec-init` right away and let steering evolve as those rules become clear.
- **Brownfield** – start with `/kiro:validate-gap` and `/kiro:validate-design` to ensure new specs reconcile with the existing system before implementation.

## Skills Workflow (3.0)

Skills mode (`--claude-skills`, `--codex-skills`, `--cursor-skills`, `--copilot-skills`, `--windsurf-skills`, `--opencode-skills`, `--gemini-skills`, `--antigravity`) provides an alternative workflow that uses skill-based commands instead of `/kiro:*` slash commands. The spec phases are the same, but implementation and validation work differently. For the complete skills-mode surface, including `/kiro-impl` subagent flow and customization, see the [Skill Reference](skill-reference.md).

### Commands vs Skills Equivalents

| Phase | Commands Mode | Skills Mode | Notes |
|-------|--------------|-------------|-------|
| Discovery | N/A | `/kiro-discovery` | Skills-mode-only routing/scoping entry point; writes brief.md and, when needed, roadmap.md |
| Spec Batch | N/A | `/kiro-spec-batch` | Parallel multi-spec creation with cross-spec review |
| Steering | `/kiro:steering` | `/kiro:steering` | Same in both modes |
| Spec (init through tasks) | `/kiro:spec-init` ... `/kiro:spec-tasks` | Same | Same in both modes |
| Implementation | `/kiro:spec-impl <feature> <tasks>` | `/kiro-impl` | See below |
| Validation | `/kiro:validate-impl` | `/kiro-validate-impl` | Integration-focused in skills mode |

### `/kiro-impl` Modes

- **Autonomous mode** (no task args): Spawns a fresh implementer subagent per task plus an independent reviewer subagent. If the implementer is blocked or the reviewer rejects after 2 remediation rounds, a **debug subagent** is spawned in a fresh context to investigate root causes (with web search) and produce a fix plan. A new implementer then retries with the debug findings. Max 2 debug rounds per task. Cross-cutting insights are recorded as **Implementation Notes** and injected into subsequent implementer prompts.
- **Manual mode** (with task args): Runs TDD in the main conversation context, similar to the commands-based `/kiro:spec-impl`.

Both modes enforce **1-task-per-iteration** discipline for context hygiene during long runs and are **session-resume safe** -- you can re-run `/kiro-impl` after an interruption without losing progress. Both modes also follow the **Feature Flag TDD** protocol (RED then GREEN) for safe, incremental delivery.

### `/kiro-spec-batch` for Parallel Spec Creation

`/kiro-spec-batch` creates multiple specs in parallel from the roadmap produced by `/kiro-discovery`. After all specs are generated, it runs a **cross-spec review** to detect contradictions, duplicated responsibilities, and interface mismatches across the batch. For Codex installs, the cross-spec review is delegated to `.codex/agents/spec-reviewer.toml`.

### Session Persistence via `brief.md`

`/kiro-discovery` writes `brief.md` to the spec workspace. This file persists across sessions, allowing you to resume a workstream without re-explaining scope. Downstream skills (`/kiro-spec-batch`, `/kiro-impl`) read the brief automatically when present.

### After Discovery

`/kiro-discovery` is a router, not an auto-runner. For first-time users, the important mental model is simple: start here when you have a new request but do not yet know whether it should become one spec, many specs, or no spec at all. It should decide the path, write the persistent files (`brief.md`, `roadmap.md` when needed), suggest the correct next command, and then stop.

| Discovery Result | Meaning | Default Next Step | Optional Path |
|------------------|---------|-------------------|---------------|
| Existing spec | The request belongs inside an approved or active spec | `/kiro-spec-requirements {feature}` | None |
| No spec needed | The request is small enough to implement directly | Implement directly | None |
| Single spec | One new feature should become one spec | `/kiro-spec-init <feature>` | `/kiro-spec-quick <feature>` when you intentionally want to continue immediately |
| Multi-spec | The work should be decomposed into multiple specs | `/kiro-spec-batch` | `/kiro-spec-init <first-feature>` if you want to validate the first slice before batching the rest |
| Mixed decomposition | The request spans existing-spec updates, new specs, and/or direct implementation | Discovery writes the split into `brief.md` / `roadmap.md` before you continue | Start with the next step suggested for the new-spec portion, then come back to the remaining items |

This split keeps discovery lightweight and preserves the phase gates that make cc-sdd reliable. Discovery is there to choose the right workflow, not to replace it.

### `/kiro-validate-impl` in Skills Mode

In skills mode, validation focuses on **integration** concerns: cross-task consistency, boundary correctness, revalidation triggers, and mechanical enforcement. Per-task correctness is handled by the reviewer subagent during implementation.

## Multi-spec Ownership and Revalidation

When one spec fails because an upstream, foundation, or shared spec is broken, fix the owning upstream spec first. Do not patch around that defect inside the downstream feature just to make its local validation pass.

After an upstream fix lands, re-run validation and the relevant runtime smoke checks for dependent specs before declaring the overall system healthy. In practice, this means:

- classify failures as local to the current spec, owned by an upstream dependency, or unclear
- route upstream-owned defects back to the owning spec instead of hiding them in downstream remediation
- revalidate dependent specs whose contracts, wiring, startup path, or shared interfaces rely on the upstream fix

## Related Resources

- [Quick Start in README](../../README.md#quick-start)
- [Skill Reference](skill-reference.md)
- [Claude Code Subagents Workflow](claude-subagents.md)
- [OpenAI: Harness engineering: leveraging Codex in an agent-first world](https://openai.com/index/harness-engineering/)
- [InfoQ: Spec Driven Development: When Architecture Becomes Executable](https://www.infoq.com/articles/spec-driven-development/)
