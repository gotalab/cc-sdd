# Agent compatibility

cc-sdd installs 17 skills for each of its eight current integrations and retains a deprecated Cascade adapter for migration. The host determines how those skills are invoked, whether fresh subagents are available, and which permissions they have. Stable and beta labels describe integration maturity; they do not make different execution surfaces equivalent.

## Execution surfaces

The upstream interfaces below were checked on September 23, 2026. They describe documented host capabilities, not a new live certification of cc-sdd.

| Installation | Scope and execution |
| --- | --- |
| `--claude-skills` | Claude Code skills. Native subagents can provide separate implementer/reviewer contexts. |
| `--codex-skills` | Codex skills in `.agents/skills`, invoked with `$kiro-*`. Current Codex releases enable subagents by default; session tools and policy still determine availability. |
| `--cursor-skills` | Cursor skills. Editor, CLI, and cloud sessions can differ in configuration and access to personal skills. |
| `--copilot-skills` | Copilot skills. VS Code and Copilot CLI support subagents; GitHub.com skills do not imply that same delegation capability. |
| `--devin` / `--devin-skills` | New beta adapter for Devin Local in Devin Desktop and Devin CLI. Installs `.devin/skills` and uses `/kiro-*` with native subagents when enabled. Installation and runtime checks are pending. Devin Cloud is outside this adapter’s scope. |
| `--windsurf-skills` (deprecated) | Legacy Cascade migration support. Keeps `.windsurf/skills` and `@kiro-*`; implementation and review execute in the main context. |
| `--opencode-skills` | OpenCode skills. Check discovery, invocation, and available subagent tools in the client/version being used. |
| `--gemini-skills` | Gemini CLI skills. Gemini CLI remains a separate integration from Antigravity. Available subagent tools determine isolated execution. |
| `--antigravity` / `--antigravity-skills` | Antigravity skills in `.agents/skills`. Antigravity 2.0 and CLI document slash invocation and native subagents. Use the inline fallback when delegation is unavailable. |

Independent review requires a separate reviewer context. When a workflow uses its inline fallback, it still applies the review protocol and required approval checks, but must describe the result as inline review. Installing the skill files or passing installer tests does not establish independent review, background completion, or session recovery.

Sources: [Claude Code subagents](https://code.claude.com/docs/en/sub-agents), [Codex subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents), [Cursor skills](https://cursor.com/docs/skills), [Copilot surface matrix](https://docs.github.com/en/copilot/reference/customization-cheat-sheet), [OpenCode skills](https://opencode.ai/docs/skills/), [Gemini CLI subagents](https://geminicli.com/docs/core/subagents/), [Antigravity skills](https://antigravity.google/docs/skills), [Antigravity subagents](https://antigravity.google/docs/subagents).

## Migrating Windsurf / Cascade to Devin

Use `npx cc-sdd@latest --devin` (alias `--devin-skills`) for Devin Local in Devin Desktop or Devin CLI. The `devin-skills` adapter installs skills in `.devin/skills` and a root `AGENTS.md` quickstart. Controllers run in the main conversation and delegate through the available native subagent tools.

Both `--windsurf` and `--windsurf-skills` are deprecated cc-sdd targets retained for existing Cascade installations. They keep their original `.windsurf/workflows` and `.windsurf/skills` destinations and print the Devin migration command. Their names are not aliases for the new adapter, and installing Devin does not move or delete old files. This cc-sdd deprecation policy does not assert a vendor shutdown date.

To migrate an existing project:

1. Preserve your current `.windsurf` customizations, `AGENTS.md`, steering, and specs. Render the Devin installation in an empty staging directory with the same language and `--kiro-dir` setting before updating a customized project.
2. Review the rendered `.devin/skills`, supporting resources, and quickstart. Merge relevant project guidance into `AGENTS.md`; preserve existing `.kiro/specs` and steering rather than replacing them with fresh templates.
3. Reconcile duplicate skill names. Devin also discovers `.windsurf/skills`, `.agents/skills`, and other supported locations; do not assume two copies are merged or that retaining an old name proves the new workflow is loaded. Retire old duplicates only after inspecting the intended copy and preserving human changes.
4. Start Devin CLI in the project or choose Devin Local in Devin Desktop. Invoke `/kiro-discovery` or `/kiro-spec-status <feature>` and confirm the selected skill comes from the new installation. Cascade's `@kiro-*` invocation and legacy workflows are not the new entry point.

For implementation, review that runs tests, and debugging, the adapter requests `subagent_general`. `subagent_explore` is read-only. Foreground workers can surface required approvals; background workers can only use previously approved tools. The parent waits for completion and keeps implementation writers sequential. Built-in children do not delegate further by default, so batch workers apply their required phase reviews inline. When native delegation is disabled or unavailable, the workflow reports inline execution and review instead of claiming independent review. No host permission or global configuration is changed by installation.

Devin Local and CLI share a harness; Devin Cloud has separate execution behavior and is outside this integration's scope. The adapter remains beta until installation, invocation, independent review, and recovery have been exercised on recorded host versions.

Sources: [Devin Local](https://docs.devin.ai/desktop/devin-local), [Devin CLI skills](https://docs.devin.ai/cli/extensibility/skills/overview), [subagent profiles and lifecycle](https://docs.devin.ai/cli/subagents), [project instructions](https://docs.devin.ai/cli/extensibility/rules).

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
