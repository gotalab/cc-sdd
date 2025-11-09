# Spec-Driven Development Workflow (WIP)

> 📖 **日本語ガイドはこちら:** [仕様駆動開発ガイド (日本語)](ja/spec-driven.md)

This document explains how cc-sdd implements Spec-Driven Development (SDD) inside the AI-Driven Development Life Cycle (AI-DLC). Use it as a reference when deciding which slash command to run, what artifact to review, and how to adapt the workflow to your team.

## Lifecycle Overview

1. **Steering (Context Capture)** – `/kiro:steering` and `/kiro:steering-custom` gather architecture, conventions, and domain knowledge into steering docs.
2. **Spec Initiation** – `/kiro:spec-init <feature>` creates the feature workspace (`.kiro/specs/<feature>/`).
3. **Requirements** – `/kiro:spec-requirements <feature>` collects clarifications and produces `requirements.md`.
4. **Design** – `/kiro:spec-design <feature>` first emits/updates `research.md` with investigation notes (skipped when no research is needed), then yields `design.md` for human approval.
5. **Task Planning** – `/kiro:spec-tasks <feature>` creates `tasks.md`, mapping deliverables to implementable chunks and tagging each wave with `P0`, `P1`, etc. so teams know which tasks can run in parallel.
6. **Implementation** – `/kiro:spec-impl <feature> <task-ids>` drives execution and validation.
7. **Quality Gates** – optional `/kiro:validate-gap` and `/kiro:validate-design` commands compare requirements/design against existing code before implementation.
8. **Status Tracking** – `/kiro:spec-status <feature>` summarises progress and approvals.

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

## Related Resources

- [Quick Start in README](../../README.md#-quick-start)
- [Claude Code Subagents Workflow](claude-subagents.md)
