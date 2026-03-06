# Context Window Management

## Overview

The Context Window Management system prevents LLM context overflow by proactively monitoring context usage and initiating handoffs when thresholds are exceeded.

## Features

- **Real-time Context Monitoring**: Track context window utilization across Claude Code and OpenCode
- **Automatic Handoff**: Create handoff documents when context exceeds 70% utilization
- **Seamless Continuation**: Resume work from handoff documents in new sessions
- **Visual Status Display**: Context status bar shows current usage at a glance (Claude Code only)

## Configuration

Configuration is stored in `.kiro/settings/context-config.json`:

| Option                  | Type    | Default                 | Description                                     |
| ----------------------- | ------- | ----------------------- | ----------------------------------------------- |
| `threshold_percentage`  | number  | 70                      | Context usage percentage that triggers handoff  |
| `warning_percentage`    | number  | 60                      | Context usage percentage that shows warning     |
| `handoff_enabled`       | boolean | true                    | Enable/disable automatic handoff                |
| `handoff_directory`     | string  | `{{KIRO_DIR}}/handoffs` | Directory for handoff documents                 |
| `display_mode`          | string  | `always`                | `always` or `threshold` (only when approaching) |
| `token_budget_override` | number  | null                    | Override auto-detected token budget             |

## Usage

### Automatic Handoff

When context usage exceeds 70%, the system automatically:

1. Creates a handoff document in `.kiro/handoffs/`
2. Displays the handoff document location
3. Provides continuation instructions

### Resuming Work

To resume work from a handoff document:

**Claude Code Agent:**

```
/resume <handoff-id>
```

**OpenCode Agent:**

```
/kiro:resume <handoff-id>
```

### Handoff Document Structure

Handoff documents contain:

- **Metadata**: Handoff ID, timestamp, context percentage, feature name
- **Completed Work**: Tasks that were finished
- **In-Progress Work**: Current task and next steps
- **Remaining Work**: Task queue with dependencies
- **Continuation Instructions**: What the next session should do
- **Key Files**: Important files for context
- **Decisions Log**: Architectural decisions made
- **Validation Checkpoints**: Items to verify

## Context Status Display

The status bar shows context usage (Claude Code only):

- **SAFE** (0-60%): Green indicator
- **CAUTION** (60-70%): Yellow indicator with warning
- **HANDOFF** (70%+): Red indicator, handoff initiated

Example:

```
[CTX: 45.2%] SAFE
```

## MCP Tools

The Context Monitor MCP Server provides these tools:

### get_session_context_size

Get current context window utilization.

### check_context_threshold

Check if context usage exceeds the threshold.

### get_context_summary

Get a formatted context summary for display.

## Best Practices

1. **Monitor Early**: Check context status at the start of complex tasks
2. **Plan Handoffs**: Be aware of handoff points in long workflows
3. **Review Handoffs**: Read handoff documents carefully when resuming
4. **Clean Up**: Remove old handoff documents after successful continuation

## Troubleshooting

### Context Not Detected

If context is not being detected:

- Ensure the MCP server is running
- Check session file permissions
- Verify the CLI tool is supported

### Handoff Not Created

If handoff is not created automatically:

- Check `handoff_enabled` is true in config
- Verify `.kiro/handoffs/` directory exists
- Check for write permissions

### Resume Command Not Found

If resume command is not available:

- Verify the agent mode supports handoff
- Check manifest includes resume command
- Ensure handoff agent is registered
