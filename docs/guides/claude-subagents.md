# Claude Code SubAgents Workflow　(WIP)

This guide covers the `--claude-agent` / `--claude-code-agent` installation target that ships 12 Claude slash commands plus 9 SubAgents. It explains when to use the SubAgent pathways, how they differ from the standard Claude Code prompts, and what files are produced.

## Installation Recap

- Install with `npx cc-sdd@latest --claude-agent --lang <code>`.
- Files are placed under:
  - `.claude/commands/kiro/` – 12 high-level commands (spec, steering, validation).
  - `.claude/agents/kiro/` – 9 SubAgent definitions used for deeper analysis, file expansion, and reporting.
  - `CLAUDE.md` – quickstart and usage tips.

## When the SubAgent Runs

Each Claude command includes instructions that decide whether to call a SubAgent. Typical triggers:

- Large repositories where file pattern expansion is required.
- Commands that need Triage (e.g., `/kiro:spec-impl` parsing task IDs).
- Validation flows that summarise results back to the main conversation.

The SubAgent is invoked through the Task Tool with curated file patterns, allowing it to inspect source files without losing the main agent conversation history.

## Command / SubAgent Matrix

| Command | SubAgent | Purpose |
|---------|----------|---------|
| `spec-quick` | (orchestrates multiple SubAgents) | Execute the full spec pipeline (`spec-init → requirements → design → tasks`) in one run, capturing drafts for review.
| `spec-requirements` | `agents/spec-requirements.md` | Expand clarifications, draft requirements, highlight unknowns.
| `spec-design` | `agents/spec-design.md` | Generate architecture notes, list impacted components, propose diagrams.
| `spec-tasks` | `agents/spec-tasks.md` | Derive implementation tasks and acceptance criteria per requirement.
| `spec-impl` | `agents/spec-impl.md` | Interpret task IDs, gather relevant source files, guide implementation.
| `validate-gap` | `agents/validate-gap.md` | Compare requirements vs current code.
| `validate-design` | `agents/validate-design.md` | Ensure design aligns with existing architecture.
| `validate-impl` | `agents/validate-impl.md` | Run implementation-level QA checklists.
| `steering` | `agents/steering.md` | Analyse repository structure, recommend context to capture.
| `steering-custom` | `agents/steering-custom.md` | Build domain-specific steering with interactive prompts.

`spec-quick` leverages the same SubAgents as the individual phases but chains them together. It creates the spec directory, drafts requirements, design, and tasks, and pauses for your review between phases. Treat it as an accelerator—after the first pass, you can still rerun the dedicated commands to refine each document.

## Recommended Workflow

1. Run `/kiro:steering` to populate project memory. The SubAgent automatically detects languages, frameworks, and architectural cues.
2. Choose your spec creation path:
   - **Standard**: `/kiro:spec-init <feature>` followed by `/kiro:spec-requirements`, `/kiro:spec-design`, `/kiro:spec-tasks` for step-by-step control.
   - **Accelerated**: `/kiro:spec-quick <feature>` to run the full sequence with SubAgent pauses between phases.
3. During each phase the SubAgent:
   - Presents a summary to the user in the main conversation.
   - Stores detailed outputs under `.kiro/specs/<feature>/`.
   - Awaits your approval before moving forward. Avoid using global auto-approval flags (`--auto`, `-y`) in production, because SubAgent checkpoints are designed to surface review gates for the team.
4. Optionally run `/kiro:validate-gap` or `/kiro:validate-design` to compare against the existing codebase.
5. Execute `/kiro:spec-impl <feature> <task-ids>` to implement individual tasks with SubAgent guidance.
6. Finish with `/kiro:spec-status` for an overview of approvals and pending work.

## Customising SubAgent Behaviour

- Adjust the prompts under `.claude/agents/kiro/` to embed company-specific heuristics (e.g., preferred testing frameworks or risk categories).
- Tune `.claude/commands/kiro/*.md` to change when SubAgents trigger (`call_subagent` sections) or to add guardrail instructions.
- Keep SubAgent prompts concise; the Task Tool window is shorter than the primary conversation.

## Troubleshooting

- **SubAgent not triggering** – ensure you have installed with `--claude-agent` flag and that `.claude/agents/kiro/` exists.
- **Too many files analysed** – edit the file pattern expansion step in the relevant SubAgent prompt to narrow the search.
- **Outputs differ from templates** – update `{{KIRO_DIR}}/settings/templates` so that SubAgent summaries point to the latest document sections.

## See Also

- [Spec-Driven Development Workflow](spec-driven.md)
- [Project README Installation Matrix](../../README.md#-supported-coding-agents)
