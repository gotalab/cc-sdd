# Spec-Driven Development Workflow (WIP)

> 📖 **日本語ガイドはこちら:** [仕様駆動開発ガイド (日本語)](ja/spec-driven.md)

This document explains how cc-sdd implements Spec-Driven Development (SDD) inside the AI-Driven Development Life Cycle (AI-DLC). Use it as a reference when deciding which slash command to run, what artifact to review, and how to adapt the workflow to your team.

## Lifecycle Overview

0. **Brainstorm (Entry Point)** – `/kiro-brainstorm` (skills mode only) is the recommended entry point for new work. It presents four action paths (A: new feature, B: enhance existing, C: fix bug, D: refactor/chore) and produces `brief.md` + `roadmap.md`. The brief persists across sessions, so you can resume where you left off without re-explaining the feature.
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

Skills mode (`--claude-skills` / `--codex-skills`) provides an alternative workflow that uses skill-based commands instead of `/kiro:*` slash commands. The spec phases are the same, but implementation and validation work differently.

### Commands vs Skills Equivalents

| Phase | Commands Mode | Skills Mode | Notes |
|-------|--------------|-------------|-------|
| Brainstorm | N/A | `/kiro-brainstorm` | Entry point; action paths A/B/C/D, writes brief.md + roadmap.md |
| Spec Batch | N/A | `/kiro-spec-batch` | Parallel multi-spec creation with cross-spec review |
| Steering | `/kiro:steering` | `/kiro:steering` | Same in both modes |
| Spec (init through tasks) | `/kiro:spec-init` ... `/kiro:spec-tasks` | Same | Same in both modes |
| Implementation | `/kiro:spec-impl <feature> <tasks>` | `/kiro-impl` | See below |
| Validation | `/kiro:validate-impl` | `/kiro-validate-impl` | Integration-focused in skills mode |

### `/kiro-impl` Modes

- **Autonomous mode** (no task args): Dispatches a fresh implementer subagent per task plus an independent adversarial reviewer subagent. Each implementer synthesizes a **Task Brief** with concrete acceptance criteria from the spec before coding. Uses native Agent tool, no external dependencies.
- **Manual mode** (with task args): Runs TDD in the main conversation context, similar to the commands-based `/kiro:spec-impl`.

Both modes enforce **1-task-per-iteration** discipline for context hygiene during long runs and are **session-resume safe** -- you can re-run `/kiro-impl` after an interruption without losing progress. Both modes also follow the **Feature Flag TDD** protocol (RED then GREEN) for safe, incremental delivery.

### `/kiro-spec-batch` for Parallel Spec Creation

`/kiro-spec-batch` creates multiple specs in parallel from the roadmap produced by `/kiro-brainstorm`. After all specs are generated, it runs a **cross-spec review** to detect contradictions, duplicated responsibilities, and interface mismatches across the batch. For Codex installs, the cross-spec review is delegated to `.codex/agents/spec-reviewer.toml`.

### Session Persistence via `brief.md`

`/kiro-brainstorm` writes `brief.md` to the spec workspace. This file persists across sessions, allowing you to resume a feature conversation without re-explaining scope. Downstream skills (`/kiro-spec-batch`, `/kiro-impl`) read the brief automatically when present.

### `/kiro-validate-impl` in Skills Mode

In skills mode, validation focuses on **integration** concerns: cross-task consistency, boundary correctness (verified via `git diff`), and mechanical enforcement (grep for leftover TODOs, run full test suite). Per-task correctness is handled by the reviewer subagent during implementation.

## Related Resources

- [Quick Start in README](../../README.md#-quick-start)
- [Claude Code Subagents Workflow](claude-subagents.md)
