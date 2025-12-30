# cc-sdd Migration Guide

> 📖 **日本語ガイドはこちら:** [マイグレーションガイド (日本語)](ja/migration-guide.md)

cc-sdd 1.x (especially 1.1.5) and 2.0.0 share the same AI-DLC philosophy and command list, but the **design artifacts, templates, and steering structure were rebuilt from the ground up**. Use this guide to pick one of two clear paths—either keep running 1.1.5 as-is, or accept the discontinuity and move to 2.0.0 where templates/rules make customization instant.

---

## TL;DR – choose your path

| Goal | Recommended action |
| --- | --- |
| Keep the legacy 1.x workflow untouched | Run `npx cc-sdd@1.1.5` whenever you install/refresh files. Continue editing agent-specific prompt folders (only the original 8 spec/steering commands exist). |
| Adopt unified templates, research/design split, and consistent behavior across all 8 supported agents | Reinstall with `npx cc-sdd@latest` (=2.0.0) and customize only `.kiro/settings/templates/*` plus `.kiro/settings/rules/` (full 11-command set, including validate-*). |

> ⚠️ Mixing 1.x and 2.x layouts in the same `.kiro` tree is not supported. Pick one path per repo/branch.

### What carries over unchanged

- `.kiro/specs/<feature>/` directories you already authored remain valid inputs; simply regenerate newer templates when you are ready.
- `.kiro/steering/` (or a single `steering.md`) can be reused as-is—the content is still consumed verbatim as project memory.
- The 11 AI-DLC commands (`spec-*`, `validate-*`, `steering*`) and the high-level spec→design→tasks→impl flow stay identical; only the template internals have moved to a just-in-time, agentic style.

---

## 1. Staying on cc-sdd 1.1.5 (fallback option)

1.1.5 is no longer on `@latest`, but you can pin it explicitly:

```bash
npx cc-sdd@1.1.5 --claude-code   # legacy flag name (use --cursor / --gemini / etc. for others)
npx cc-sdd@1.1.5 --lang ja       # legacy i18n flags still work
```

- You can keep editing `.claude/commands/*`, `.cursor/prompts/*`, `.codex/prompts/*` などのエージェント別フォルダを直接編集するスタイルで運用できます。
- Agent-specific directory layouts stay exactly as they were in v1.
- No new features will land here—future work targets `@latest` only.
- The validate commands (`/kiro:validate-gap`, `-design`, `-impl`) do **not** exist in 1.1.5. If you rely on those gates, migrate to v2.

---

## 2. Why 2.0.0 is worth the jump

> The AI-DLC workflow (spec-init → design → tasks → impl, with validation gates) and the 11 command entry points are unchanged. What changed is **where you customize and how much structure the resulting docs provide.**

- **Template & rules driven customization** – stop patching commands; edit `.kiro/settings/templates/` and `.kiro/settings/rules/` once and every agent picks it up.
- **Spec fidelity** – Research.md captures discovery logs while Design.md becomes reviewer friendly with Summary tables, Req Coverage, Supporting References, and lighter Components/Interfaces blocks.
- **Steering = Project Memory** – drop structured knowledge across `.kiro/steering/*.md` files and every command consumes it.
- **Brownfield guardrails** – `/kiro:validate-gap`, `validate-design`, `validate-impl` plus the research/design split make gap analysis and existing-system upgrades much safer.
- **Unified coverage** – all 8 supported agents (Claude Code, Claude Subagents, Cursor, Codex CLI, Gemini CLI, GitHub Copilot, Qwen Code, OpenCode, Windsurf) run the same 11-command workflow, so mixing agents (e.g., Cursor + Claude) requires zero spec rewrites.

---

## 3. Recommended migration steps

1. **Backup**
   ```bash
   cp -r .kiro .kiro.backup
   cp -r .claude .claude.backup   # repeat for .cursor, .codex, …
   ```

2. **Install v2 cleanly (reuse interactive choices)**
   ```bash
   npx cc-sdd@latest                 # default (Claude Code)
   npx cc-sdd@latest --cursor        # other agents
   npx cc-sdd@latest --claude-agent  # Subagents mode
   ```
   - The installer now prompts per file group (overwrite / append / keep). You can choose “append” for steering/specs to merge existing documents, or “keep” to skip untouched assets.

3. **Regenerate + merge templates/rules**
   - New layout: `.kiro/settings/templates/` (centralized) + `.kiro/settings/rules/`.
   - Compare the new templates with any custom logic you previously kept inside agent prompt folders and move the reusable parts into templates/rules.

4. **Move custom rules**
   - Place Markdown files under `.kiro/settings/rules/`. Every spec/design/tasks command reads them.
   - Anything you previously hard-coded into prompts becomes a rule entry (“DO/DO NOT …”).

5. **Rebuild steering (optional)**
   - Split project memory into files such as `project-context.md`, `architecture.md`, `domain-knowledge.md`.
   - Research/design templates reference this folder, so migrate existing notes here.

6. **Update automation**
   - Point all scripts/docs to `npx cc-sdd@latest`; retire `@next` usage.
   - Map old manual command invocations to the 11 supported ones (`spec-*`, `validate-*`, `steering*`).

---

## 4. Mapping legacy edits to v2

| Legacy touchpoint | v2 replacement | Notes |
| --- | --- | --- |
| `.claude/commands/spec-design.prompt.md` などエージェント別コマンドファイル | `.kiro/settings/templates/specs/design.md` | Templates now live in `.kiro/settings/templates/` and generate Summary/Supporting References automatically. |
| `.claude/commands/<cmd>.prompt`, `.cursor/prompts/*` | `.kiro/settings/rules/*.md` | Replace prompt edits with shared rule statements so every agent receives identical guidance. |
| `.kiro/steering/` (single file or not) | `.kiro/steering/*.md` with clearer principles/guides | Same folder path; v2 simply encourages breaking content into focused project-memory guides. |
| Research notes interleaved in design.md | `.kiro/specs/<feature>/research.md` + Supporting References section | Design stays reviewer friendly; research keeps raw findings without cluttering the main body. |

---

## 5. FAQ / troubleshooting

**Can I reuse old templates inside v2?** – Technically yes, but you lose Req Coverage and Supporting References, so generation quality drops. Prefer porting content into the new templates/rules.

**Can I switch between 1.1.5 and 2.0.0 in one repo?** – Only if you isolate `.kiro` per branch or automate swapping directories; the layouts conflict.

**After editing templates, which commands should I run?** – At minimum: `/kiro:steering`, `/kiro:spec-init`, `/kiro:spec-design` to regenerate Research/Design/Tasks with the new format.

---

## 6. Takeaways

- **Stay on 1.1.5** if you just need the legacy workflow—pin the version and continue as before.
- **Move to 2.0.0** if you want unified templates, Supporting References, research/design separation, and minimal maintenance via rules.
- Future features and fixes target v2+, so upgrading unlocks the full spec-driven development experience.
