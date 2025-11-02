<div align="center" style="font-size: 1.2rem; margin-bottom: 1rem;"><sub>
<a href="./tools/cc-sdd/README.md">English</a> | <a href="./tools/cc-sdd/README_ja.md">日本語</a> | <a href="./tools/cc-sdd/README_zh-TW.md">繁體中文</a>
</sub></div>

# cc-sdd: Customize spec-driven development for your team's workflow

<!-- npm badges -->
[![npm version](https://img.shields.io/npm/v/cc-sdd?logo=npm)](https://www.npmjs.com/package/cc-sdd?activeTab=readme)
[![npm (next)](https://img.shields.io/npm/v/cc-sdd/next?logo=npm)](https://www.npmjs.com/package/cc-sdd?activeTab=versions)
[![install size](https://packagephobia.com/badge?p=cc-sdd)](https://packagephobia.com/result?p=cc-sdd)
[![license: MIT](https://img.shields.io/badge/license-MIT-green.svg)](tools/cc-sdd/LICENSE)

✨ **Transform Claude Code / Codex / Cursor / Gemini CLI / GitHub Copilot / Qwen Code / Windsurf from prototype to production-ready development, while customizing every spec and steering template so the generated requirements, design docs, tasks, and project memory match your team's workflow from day one.**

## 🚀 Quick Start
One command installs **AI-DLC** (AI-Driven Development Life Cycle) with **SDD** (Spec-Driven Development) workflows for Claude Code, Cursor IDE, Gemini CLI, Codex CLI, GitHub Copilot, Qwen Code, and Windsurf IDE.
It also scaffolds team-aligned templates—requirements, design reviews, task plans, and steering docs—so every slash command outputs documentation that fits your existing approval process.

```bash
# Basic installation (default: Claude Code)
npx cc-sdd@latest

# Alpha version with major updates (v2.0.0-alpha.3)
npx cc-sdd@next

# With language: --lang en|ja|zh-TW|zh|es|pt|de|fr|ru|it|ko|ar
npx cc-sdd@latest --lang ja

# With different agents: gemini, cursor, codex, copilot, qwen, windsurf
npx cc-sdd@latest --claude    # or @next for latest alpha
npx cc-sdd@next --claude-agent    # Installs Claude Code SubAgents (requires @next)
npx cc-sdd@latest --gemini    # or @next for latest alpha
npx cc-sdd@latest --cursor    # or @next for latest alpha
npx cc-sdd@next --codex       # Requires alpha version
npx cc-sdd@next --copilot     # Requires alpha version
npx cc-sdd@latest --qwen      # or @next for latest alpha
npx cc-sdd@next --windsurf    # Requires alpha version (Windsurf workflows)

# Ready to go! Your chosen agent can now run `/kiro:spec-init <what-to-build>` and unlock the full SDD workflow
```

## ✨ What You Get

After running cc-sdd, you'll have:

- **Team workflow alignment** — tailor requirements, design, task, and steering templates so outputs fit your review and approval process
- **11 powerful slash commands** (`/kiro:steering`, `/kiro:spec-requirements`, `/kiro:validate-gap`, etc.)
- **Project Memory (steering)** - AI learns your codebase, patterns, and preferences
- **Structured AI-DLC workflow** with quality gates and approvals
- **Spec-Driven Development** methodology built-in
- **Kiro IDE compatibility** for seamless spec management

**Perfect for**: Feature development, code reviews, technical planning, and maintaining development standards across your team.

## 🎨 Customization

Edit templates in `{{KIRO_DIR}}/settings/templates/` to match your workflow. Keep the core structure (requirement numbers, checkboxes, headings) and add your team's context—AI adapts automatically.

**Common customizations**:
- **PRD-style requirements** with business context and success metrics
- **Frontend/Backend designs** optimized for React components or API specs
- **Approval gates** for security, architecture, or compliance reviews
- **JIRA/Linear-ready tasks** with estimation, priority, and labels
- **Domain steering** for API standards, testing conventions, or coding guidelines

📖 **[Customization Guide](docs/guides/customization-guide.md)** — 7 practical examples with copy-paste snippets

## 🤖 Supported Coding Agents

| Agent | Flags you can pass | Installs |
| --- | --- | --- |
| Claude Code | `--claude-code`, `--claude` | `.claude/commands/kiro/`, `{{KIRO_DIR}}/settings/`, `CLAUDE.md` |
| Claude Code SubAgents | `--claude-code-agent`, `--claude-agent` | `.claude/commands/kiro/` (12 commands), `.claude/agents/kiro/` (9 subagents), `{{KIRO_DIR}}/settings/`, `CLAUDE.md` — requires `cc-sdd@next` |
| Codex CLI | `--codex`, `--codex-cli` | `.codex/prompts/`, `{{KIRO_DIR}}/settings/`, `AGENTS.md` |
| Cursor IDE | `--cursor` | `.cursor/commands/kiro/`, `{{KIRO_DIR}}/settings/`, `AGENTS.md` |
| GitHub Copilot Chat | `--copilot`, `--github-copilot` | `.github/prompts/`, `{{KIRO_DIR}}/settings/`, `AGENTS.md` |
| Gemini CLI | `--gemini-cli`, `--gemini` | `.gemini/commands/kiro/`, `{{KIRO_DIR}}/settings/`, `GEMINI.md` |
| Qwen Code | `--qwen-code`, `--qwen` | `.qwen/commands/kiro/`, `{{KIRO_DIR}}/settings/`, `QWEN.md` |
| Windsurf IDE | `--windsurf` | `.windsurf/workflows/`, `{{KIRO_DIR}}/settings/`, `AGENTS.md` — requires `cc-sdd@next` |

*Claude Code remains the default agent when no flag is supplied.*

## 🌐 Supported Languages

| Language | Code |  |
|----------|------|------|
| English | `en` | 🇬🇧 |
| Japanese | `ja` | 🇯🇵 |
| Traditional Chinese | `zh-TW` | 🇹🇼 |
| Simplified Chinese | `zh` | 🇨🇳 |
| Spanish | `es` | 🇪🇸 |
| Portuguese | `pt` | 🇵🇹 |
| German | `de` | 🇩🇪 |
| French | `fr` | 🇫🇷 |
| Russian | `ru` | 🇷🇺 |
| Italian | `it` | 🇮🇹 |
| Korean | `ko` | 🇰🇷 |
| Arabic | `ar` | 🇸🇦 |

**Usage**: `npx cc-sdd@latest --lang <code>` (e.g., `--lang ja` for Japanese)

---

## 📖 Documentation

> **Project Overview** (Spec-Driven Development workflow)
- English: [README.md](tools/cc-sdd/README.md)
- 日本語: [README_ja.md](tools/cc-sdd/README_ja.md)
- 繁體中文: [README_zh-TW.md](tools/cc-sdd/README_zh-TW.md)

> **Command Reference**
- [Command Reference Guide](docs/guides/command-reference.md) - Complete reference for all `/kiro:*` commands with detailed usage, parameters, examples, and troubleshooting

---

## About

**cc-sdd brings Spec-Driven Development to Claude Code, Cursor IDE, Gemini CLI, Codex CLI, GitHub Copilot, Qwen Code, and Windsurf.**

Provides your project context, Project Memory (steering), and development patterns following the workflow: **requirements → design → tasks → implementation**. 

**Kiro IDE compatible** — Reuse Kiro-style SDD specs and workflows seamlessly.

---

ワンライナーで **AI-DLC（AI-Driven Development Life Cycle）** と **Spec-Driven Development（仕様駆動開発）** のワークフローを導入。プロジェクト直下に **11個のSlash / Prompt Commands** 一式と設定ファイル（Claude Code用 **CLAUDE.md** / Cursor IDE・Codex CLI・GitHub Copilot・Windsurf用 **AGENTS.md** / Gemini CLI用 **GEMINI.md** / Qwen Code用 **QWEN.md**）を配置、プロジェクトの文脈と開発パターン（**要件 → 設計 → タスク → 実装**）、**プロジェクトメモリ（ステアリング）** を含む。

**関連記事**: [Kiroの仕様書駆動開発プロセスをClaude Codeで徹底的に再現した](https://zenn.dev/gotalab/articles/3db0621ce3d6d2) (Zenn)

---

 
## 📋 AI-DLC Workflow

### For New Projects
```bash
# Start spec-driven development immediately
/kiro:spec-init User authentication with OAuth and 2FA
/kiro:spec-requirements user-auth
/kiro:spec-design user-auth -y
/kiro:spec-tasks user-auth -y
/kiro:spec-impl user-auth 1.1,1.2,1.3
```

📁 **Example Spec**: See [photo-albums-en](.kiro/specs/photo-albums-en/) for a complete spec-driven development example with requirements, design, and tasks.

![design.md - System Flow Diagram](assets/design-system_flow.png)

### For Existing Projects (Recommended)
```bash
# First establish project context
/kiro:steering                                    # AI learns existing project context

# Then proceed with development
/kiro:spec-init Add OAuth to existing auth system
/kiro:spec-requirements oauth-enhancement
/kiro:validate-gap oauth-enhancement              # Optional: analyze existing vs requirements
/kiro:spec-design oauth-enhancement -y
/kiro:validate-design oauth-enhancement           # Optional: validate design integration
/kiro:spec-tasks oauth-enhancement -y
/kiro:spec-impl oauth-enhancement 1.1,1.2,1.3
```

**Quality Gates**: Each phase requires human approval before proceeding (use `-y` to auto-approve).

**Specs as Foundation**: Based on [Kiro's proven methodology](https://kiro.dev/docs/specs/) - specs transform ad-hoc development into systematic workflows. Created specs are portable to [Kiro IDE](https://kiro.dev) for enhanced implementation guardrails and team collaboration.


## 🎯 Advanced Options

```bash
# Choose language and OS
npx cc-sdd@latest --lang ja --os mac

# Preview changes before applying
npx cc-sdd@latest --dry-run

# Safe update with backup
npx cc-sdd@latest --backup --overwrite force

# Custom specs directory
npx cc-sdd@latest --kiro-dir docs/specs
```

## Features

✅ **AI-DLC Integration** - Complete AI-Driven Development Life Cycle  
✅ **Team-process ready templates** - Requirements, design, task, and steering outputs stay aligned with your company's workflow  
✅ **Project Memory** - Steering documents that maintain comprehensive context (architecture, patterns, rules, domain knowledge) across all sessions  
✅ **Spec-Driven Development** - Structured requirements → design → tasks → implementation  
✅ **Cross-Platform** - macOS, Linux, and Windows support with auto-detection (Linux reuses mac templates)  
✅ **Multi-Language** - 12 languages (English, Japanese, Traditional Chinese, Simplified Chinese, Spanish, Portuguese, German, French, Russian, Italian, Korean, Arabic)  
✅ **Safe Updates** - Interactive prompts with backup options  

## 📚 Related Resources

� **Articles & Presentations**  
- [Kiroの仕様書駆動開発プロセスをClaude Codeで徹底的に再現した](https://zenn.dev/gotalab/articles/3db0621ce3d6d2) - Zenn Article (Japanese)
- [Claude Codeは仕様駆動の夢を見ない](https://speakerdeck.com/gotalab555/claude-codehashi-yang-qu-dong-nomeng-wojian-nai) - Speaker Deck Presentation (Japanese)

🔗 **External Resources**  
- [Kiro IDE](https://kiro.dev) - Enhanced spec management and team collaboration
- [Kiro's Spec Methodology](https://kiro.dev/docs/specs/) - Proven spec-driven development methodology

## 📦 Package Information

This repository contains the **cc-sdd** NPM package located in [`tools/cc-sdd/`](tools/cc-sdd/).

For detailed documentation, installation instructions, and usage examples, see:
- [**Tool Documentation**](tools/cc-sdd/README.md) - Complete cc-sdd tool guide
- [**Japanese Documentation**](tools/cc-sdd/README_ja.md) - 日本語版ツール説明

## Project Structure

```
cc-sdd/
├── tools/cc-sdd/              # Main cc-sdd NPM package
│   ├── src/                   # TypeScript source code
│   ├── templates/             # Agent templates (Claude Code, Cursor IDE, Gemini CLI, Codex CLI, GitHub Copilot, Qwen Code, Windsurf)
│   ├── package.json           # Package configuration
│   └── README.md              # Tool documentation
├── docs/                      # Documentation
├── .claude/                   # Example Claude Code commands
└── README.md                  # This file
```


## License

MIT License
