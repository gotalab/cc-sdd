# Skill: Check Context Window Usage

Check current context window usage and determine whether to continue, warn, or hand off.

## For Claude Code agents

Run:

```bash
cat .claude/context-status.json 2>/dev/null
```

Parse `used_percentage` from the JSON output (written by the `cc-sdd-statusline` hook).

## For OpenCode agents

Run:

```bash
cat .opencode/context-status.json 2>/dev/null
```

Parse `total_tokens` from the JSON output (written by the `context-monitor` plugin).
Calculate: `used_percentage = (total_tokens / context_window_size) * 100`
Default `context_window_size` = 200 000 for Claude models.

## Decision logic

| `used_percentage` | Action                                                                    |
| ----------------- | ------------------------------------------------------------------------- |
| < 60%             | **Safe** — continue normally                                              |
| 60–70%            | **Warning** — display `⚠️ Context at {X}%. Consider wrapping up soon.`   |
| > 70%             | **Exceeded** — create handoff document and exit with continuation prompt  |

## Display

After checking, output: `[CTX: {used_percentage}%] {safe|warning|exceeded}`

## If the status file is missing

The hook/plugin has not run yet. Skip the check and continue normally.
