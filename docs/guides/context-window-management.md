# Context Window Management

## Overview

The Context Window Management system prevents Large Language Model (LLM) context overflow by proactively monitoring context usage and stopping agents before reasoning degrades.

This feature is designed to combat **Context Rot** (also known as the "Lost in the Middle" phenomenon), a scientifically documented degradation in LLM reasoning and retrieval capabilities that occurs as the context window fills up.

## The Science: Context Rot and Performance Degradation

While modern LLMs boast massive context windows (e.g., 128k to 1M+ tokens), scientific studies show that simply having the capacity does not guarantee performance. As the context size grows, LLMs become significantly less efficient:

1. **The "Lost in the Middle" Effect**: A foundational 2023 study (Liu et al.) demonstrated that LLM accuracy follows a U-shaped curve. Models have high recall for information at the very beginning (primacy bias) and the very end (recency bias) of a prompt, but drastically fail to retrieve or reason over information placed in the middle.
2. **Context Length Alone Hurts Reasoning**: A 2025 study ("Context Length Alone Hurts LLM Performance Despite Perfect Retrieval") revealed that even when models perfectly retrieve information, the sheer volume of surrounding tokens degrades reasoning. The study observed a **13.9% to 85% drop in performance** on coding and math tasks as input length increased.
3. **Effective Context vs. Claimed Context**: Benchmarks like RULER and research from Chroma (2025) indicate that a model's "effective context length"—the threshold where it maintains reliable reasoning—is often a fraction of its claimed maximum window. As the context grows, the attention mechanism dilutes focus, causing "semantic interference" and confusing the model.

### Why the 70% Threshold?

Our default threshold triggers a context stop at **70% context utilization**.

*   **Is it scientifically sound?** Yes, as a pragmatic heuristic. Scientific data indicates that reasoning degrades non-linearly. By stopping at 70%, we ensure the model never operates in the most diluted, high-interference 30% of its window, preserving space for its output and reducing hallucination risks.
*   **A More Scientific Approach**: While 70% is a solid baseline, a more advanced (and complex) approach would be to dynamically calculate the *Effective Context Length* based on the specific task (e.g., coding tasks degrade faster than simple summarization). Future iterations could dynamically adjust this threshold based on the density of the codebase or the specific model's empirical RULER benchmark score rather than a flat percentage.

## Features

- **Real-time Context Monitoring**: Track context window utilization across Claude Code and OpenCode.
- **Inline Continuation** (`spec-impl`): Executors return a structured `PARTIAL_COMPLETION` report when context exceeds 70%; the orchestrator re-spawns them automatically with a continuation block — no files written, no manual resume needed.
- **Visual Status Display**: Context status bar shows current usage at a glance (Claude Code only).

## Configuration

Configuration is stored in `.kiro/settings/context-config.json`:

| Option                  | Type    | Default  | Description                                     |
| ----------------------- | ------- | -------- | ----------------------------------------------- |
| `threshold_percentage`  | number  | 70       | Context usage percentage that triggers a stop   |
| `warning_percentage`    | number  | 60       | Context usage percentage that shows a warning   |
| `display_mode`          | string  | `always` | `always` or `threshold` (only when approaching) |
| `token_budget_override` | number  | null     | Override auto-detected token budget             |

## Usage

### Inline Continuation (spec-impl flow)

The `spec-impl` command uses an orchestrator-per-subtask architecture that handles context limits automatically.

**How it works:**

1. `spec-impl` resolves `tasks.md` into individual subtask units (e.g., `1.1`, `1.2`, `2`).
2. For a single subtask, an executor agent (`spec-tdd-impl-agent`) is spawned directly.
3. For multiple subtasks, an orchestrator (`spec-tdd-impl-orchestrator`) is spawned. The orchestrator spawns one executor per subtask (Claude Code: via `Task` tool in parallel/sequential batches; OpenCode: sequentially within its own context).
4. When an executor exceeds 70% context, it returns a structured `STATUS: PARTIAL_COMPLETION` report — state is passed as text, nothing is written to disk.
5. The orchestrator re-spawns the executor with the same prompt plus a `--- CONTINUATION CONTEXT ---` block describing what was already done and what remains.
6. This loop continues until the subtask returns `STATUS: COMPLETE`.

## Context Status Display

The status bar shows context usage (Claude Code only):

- **SAFE** (0-60%): Green indicator (Optimal reasoning space)
- **CAUTION** (60-70%): Yellow indicator with warning (Entering degradation zone)
- **STOP** (70%+): Red indicator, agent stops and returns partial completion report

Example:

```
[CTX: 45.2%] SAFE
```

## Available Tools & Commands

Depending on the agent used, the context system exposes these utilities (via normal tool for OpenCode, or via specialized hooks for Claude Code):

### get_session_context_size
Get current context window utilization.

### check_context_threshold
Check if context usage exceeds the configured threshold.

### get_context_summary
Get a formatted context summary for display.

## Best Practices

1. **Monitor Early**: Check context status at the start of complex tasks.
2. **Trust the Orchestrator**: For `spec-impl`, the orchestrator handles context limits automatically — no manual intervention needed.
3. **Fresh Context = Better Reasoning**: A fresh executor spawn with a tight continuation block is significantly more capable than a bloated long-running session.

## Troubleshooting

### Context Not Detected
If context is not being detected:
- Check if context hooks are properly installed for Claude Code.
- Verify the OpenCode context monitoring tool is functioning properly.
- Check session file permissions and ensure `.claude/context-status.json` exists (for Claude Code).
- Verify the CLI tool is supported.
