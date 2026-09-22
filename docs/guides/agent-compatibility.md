# Agent compatibility

cc-sdd installs 17 skills for each skills adapter. The host determines how those skills are invoked, whether fresh subagents are available, and which permissions they have. Stable and beta labels describe integration maturity; they do not make different execution surfaces equivalent.

## Execution surfaces

The upstream interfaces below were checked on September 22, 2026. They describe documented host capabilities, not a new live certification of cc-sdd.

| Installation | Scope and execution |
| --- | --- |
| `--claude-skills` | Claude Code skills. Native subagents can provide separate implementer/reviewer contexts. |
| `--codex-skills` | Codex skills in `.agents/skills`, invoked with `$kiro-*`. Current Codex releases enable subagents by default; session tools and policy still determine availability. |
| `--cursor-skills` | Cursor skills. Editor, CLI, and cloud sessions can differ in configuration and access to personal skills. |
| `--copilot-skills` | Copilot skills. VS Code and Copilot CLI support subagents; GitHub.com skills do not imply that same delegation capability. |
| `--windsurf-skills` | Cascade compatibility in Devin Desktop / Windsurf. Uses `.windsurf/skills` and `@kiro-*`; implementation and review execute in the main context. |
| `--opencode-skills` | OpenCode skills. Check discovery, invocation, and available subagent tools in the client/version being used. |
| `--gemini-skills` | Gemini CLI skills. Gemini CLI remains a separate integration from Antigravity. Available subagent tools determine isolated execution. |
| `--antigravity` / `--antigravity-skills` | Antigravity skills in `.agents/skills`. Antigravity 2.0 and CLI document slash invocation and native subagents. Use the inline fallback when delegation is unavailable. |

Independent review requires a separate reviewer context. When a workflow uses its inline fallback, it still applies the review protocol and required approval checks, but must describe the result as inline review. Installing the skill files or passing installer tests does not establish independent review, background completion, or session recovery.

Sources: [Claude Code subagents](https://code.claude.com/docs/en/sub-agents), [Codex subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents), [Cursor skills](https://cursor.com/docs/skills), [Copilot surface matrix](https://docs.github.com/en/copilot/reference/customization-cheat-sheet), [OpenCode skills](https://opencode.ai/docs/skills/), [Gemini CLI subagents](https://geminicli.com/docs/core/subagents/), [Antigravity skills](https://antigravity.google/docs/skills), [Antigravity subagents](https://antigravity.google/docs/subagents).

## Windsurf, Cascade, and Devin

Windsurf was renamed Devin Desktop. Devin Local, the primary local agent in Devin Desktop, shares a harness with Devin CLI and supports native subagents. Cascade remains a separate compatibility surface with different invocation and execution behavior. Devin Cloud also has its own environment and lifecycle.

The existing `--windsurf` and `--windsurf-skills` flags retain their Cascade behavior and `.windsurf` destinations. `--windsurf` installs legacy workflows; `--windsurf-skills` installs skills. This does not add a Devin Local / CLI or Cloud adapter. Those agents can discover compatible skills, but that alone does not verify cc-sdd's full workflow on them. In particular, Devin Local does not run Cascade workflows.

Sources: [Devin Desktop announcement](https://cognition.com/blog/introducing-devin-desktop), [Devin Local and Cascade differences](https://docs.devin.ai/desktop/devin-local), [Cascade skill compatibility](https://docs.devin.ai/desktop/cascade/skills), [Devin CLI skills](https://docs.devin.ai/cli/extensibility/skills/overview).

## Antigravity installation and upgrades

Antigravity's preferred project skills directory is `.agents/skills`. The older `.agent/skills` directory remains supported upstream. cc-sdd now uses the preferred location; the installer does not move or delete an existing `.agent` directory.

For a new installation, use `--antigravity` or `--antigravity-skills` and follow the generated quickstart. Before upgrading an existing installation, check both skill locations and the root `AGENTS.md` for customizations. Codex and other agents may already use the same skill names under `.agents/skills` with different invocation instructions.

For an existing or shared installation:

1. Run the installer in an empty staging directory with the intended language and `--kiro-dir` setting. This produces rendered skills, supporting rules/templates, settings templates, and a quickstart for inspection.
2. Compare those files with the existing installation. Preserve customizations and host-specific instructions rather than overwriting another agent's same-named files.
3. Choose one Antigravity copy of each skill. To keep a working legacy layout, apply the reviewed rendered skill updates to `.agent/skills` and retain the legacy path in the quickstart. To migrate, reconcile the files in `.agents/skills` and retire old duplicates only after the host loads the intended copy.
4. Preserve `.kiro/specs` and project steering. Merge only the intended settings/template and quickstart updates. Check the selected skill's location and invocation in a fresh Antigravity session.

The installer retains its existing conflict and backup options. `--overwrite=force` (or `--yes` with the default overwrite policy) explicitly replaces conflicting destination files; it is not a migration or cross-agent merge. Copying raw source templates from this repository also bypasses installer rendering and supporting-file installation.

Source: [Antigravity skill locations and backward compatibility](https://antigravity.google/docs/skills).

## Codex configuration

Current Codex releases enable subagents by default. Existing cc-sdd setup text previously suggested experimental `[features]` flags for collaboration and multi-agent operation; those flags are not a prerequisite for this workflow on current releases.

Subagent availability can be disabled through `enabled = false` in the `[agents]` table. Keep configuration changes under the user's control; cc-sdd installs guidance and does not edit global Codex settings. Check the tools actually exposed to the session before dispatching, and use the inline fallback if delegation is unavailable.

Source: [Current Codex subagent configuration](https://learn.chatgpt.com/docs/agent-configuration/subagents).
