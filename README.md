# cc-sdd: Spec-driven development for your team's workflow

<!-- npm badges -->
[![npm version](https://img.shields.io/npm/v/cc-sdd?logo=npm)](https://www.npmjs.com/package/cc-sdd?activeTab=readme)
[![install size](https://packagephobia.com/badge?p=cc-sdd)](https://packagephobia.com/result?p=cc-sdd)
[![license: MIT](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)

<div align="center" style="font-size: 1.1rem; margin-bottom: 1rem;"><sub>
<a href="./tools/cc-sdd/README.md">English</a> | <a href="./tools/cc-sdd/README_ja.md">日本語</a> | <a href="./tools/cc-sdd/README_zh-TW.md">繁體中文</a>
</sub></div>

## Transform AI coding agents into production-ready spec-driven development

**One command. Hours instead of weeks. Requirements → Design → Tasks → Implementation.**

👻 **Kiro-inspired** — Similar Spec-Driven, AI-DLC style as Kiro IDE, so existing Kiro specs remain compatible and portable.

Stop losing 70% of development time to meetings, documentation ceremonies, and scattered context. cc-sdd brings structured **AI-DLC** (AI-Driven Development Lifecycle) and **Spec-Driven Development** to Claude Code, Cursor, Gemini CLI, Codex CLI, GitHub Copilot, Qwen Code, OpenCode, and Windsurf.

### What you get:
- ✅ **Spec-first guarantees** — Approve requirements/design upfront, then AI implements exactly as specified
- ✅ **Parallel execution ready** — Tasks decomposed for concurrent implementation with dependency tracking
- ✅ **Team-aligned templates** — Customize once, all agents output docs that fit your approval process
- ✅ **Project Memory** — AI remembers your architecture, patterns, and standards across sessions
- ✅ **8 agents, unified workflow** — Same spec-driven process across Claude, Cursor, Gemini, Codex, Copilot, Qwen, OpenCode, Windsurf
- ✅ **Hours instead of weeks** — Feature planning goes from days to hours with AI-assisted specs

## 🚀 Quick Start

```bash
# Run in your project root directory
cd your-project
npx cc-sdd@latest --claude --lang en ## Claude Code

# ✅ That's it! Now run: /kiro:spec-init <what-to-build>
```

**Installation takes 30 seconds.** Supports 8 agents (Claude (Commands / Subagents), Cursor, Gemini, Codex, Copilot, Qwen, OpenCode, Windsurf) × 13 languages.

📖 **Next steps:** [All installation options](#%EF%B8%8F-advanced-installation) | [Command Reference](docs/guides/command-reference.md) | [Spec-Driven Guide](docs/guides/spec-driven.md)

## 📋 See It In Action

### Example: Building a new Photo Albums Feature

```bash
/kiro:spec-init Photo albums with upload, tagging, and sharing
/kiro:spec-requirements photo-albums-en
/kiro:spec-design photo-albums-en -y
/kiro:spec-tasks photo-albums-en -y
```

**Generated in 10 minutes:**
- ✅ [requirements.md](.kiro/specs/photo-albums-en/requirements.md) — 15 EARS-format requirements
- ✅ [design.md](.kiro/specs/photo-albums-en/design.md) — Architecture with Mermaid diagrams
- ✅ [tasks.md](.kiro/specs/photo-albums-en/tasks.md) — 12 implementation tasks with dependencies

Want to inspect a complex, large-scale requirements set? Jump to the advanced [customer-support-rag-backend-en](.kiro/specs/customer-support-rag-backend-en/) spec for the end-to-end requirements → design → tasks flow.

![Example: design.md System Flow](assets/design-system_flow.png)

## 🎯 Use Cases

| Scenario | Workflow |
|----------|----------|
| **New feature (greenfield)** | `spec-init` → `spec-requirements` → `spec-design` → `spec-tasks` → `spec-impl` |
| **Enhance existing code (brownfield)** | `steering` → `spec-init` → (`validate-gap` →) `spec-design` → (`validate-design` →) `spec-tasks` → `spec-impl` |
| **Team process alignment** | Customize templates once in `.kiro/settings/templates/` → all agents follow same format |

## 🎨 Customization

Customize templates and rules in `{{KIRO_DIR}}/settings/` to match your team's workflow:

- **templates/** - Define document structure (requirements, design, tasks)
- **rules/** - Define AI generation principles and judgment criteria

Common use cases: PRD-style requirements, API/database schemas, approval gates, JIRA integration, domain-specific standards.

📖 **[Customization Guide](docs/guides/customization-guide.md)** — Complete guide with practical examples

## ⚙️ Advanced Installation

### Choose Your Agent

```bash
npx cc-sdd@latest --claude         # Claude Code (11 commands) [default]
npx cc-sdd@latest --claude-agent   # Claude Code Subagents (12 commands + 9 subagents)
npx cc-sdd@latest --cursor         # Cursor IDE
npx cc-sdd@latest --gemini         # Gemini CLI
npx cc-sdd@latest --codex          # Codex CLI
npx cc-sdd@latest --copilot        # GitHub Copilot
npx cc-sdd@latest --qwen           # Qwen Code
npx cc-sdd@latest --opencode       # OpenCode (11 commands)
npx cc-sdd@latest --opencode-agent # OpenCode Subagents (12 commands + 9 subagents)
npx cc-sdd@latest --windsurf       # Windsurf IDE
```

### Choose Your Language

```bash
npx cc-sdd@latest --lang ja        # Japanese
npx cc-sdd@latest --lang zh-TW     # Traditional Chinese
npx cc-sdd@latest --lang es        # Spanish
# Supports: en, ja, zh-TW, zh, es, pt, de, fr, ru, it, ko, ar, el
```

### Advanced Options

```bash
# Preview changes before applying
npx cc-sdd@latest --dry-run

# Custom specs directory
npx cc-sdd@latest --kiro-dir docs
```

---

## 📚 Documentation & Support

### 📖 Complete Guides (English | 日本語)

| Guide | What You'll Learn | Links |
|-------|-------------------|-------|
| **Command Reference** | All 11 `/kiro:*` commands with detailed usage, parameters, and examples | [English](docs/guides/command-reference.md) \| [日本語](docs/guides/ja/command-reference.md) |
| **Customization Guide** | 7 practical examples: PRD requirements, frontend/backend designs, JIRA integration | [English](docs/guides/customization-guide.md) \| [日本語](docs/guides/ja/customization-guide.md) |
| **Spec-Driven Guide** | Complete workflow methodology from requirements to implementation | [English](docs/guides/spec-driven.md) \| [日本語](docs/guides/ja/spec-driven.md) |
| **Claude Subagents** | Advanced: Using 9 specialized subagents for complex projects | [English](docs/guides/claude-subagents.md) \| [日本語](docs/guides/ja/claude-subagents.md) |
| **Migration Guide** | Upgrading from v1.x to v2.0.0 | [English](docs/guides/migration-guide.md) \| [日本語](docs/guides/ja/migration-guide.md) |

### Package Documentation
- English: [tools/cc-sdd/README.md](tools/cc-sdd/README.md)
- 日本語: [tools/cc-sdd/README_ja.md](tools/cc-sdd/README_ja.md)
- 繁體中文: [tools/cc-sdd/README_zh-TW.md](tools/cc-sdd/README_zh-TW.md)

---

## 📚 Related Resources

📝 **Articles & Presentations**
- [Kiroの仕様書駆動開発プロセスをClaude Codeで徹底的に再現した](https://zenn.dev/gotalab/articles/3db0621ce3d6d2) - Zenn Article (Japanese)
- [Claude Codeは仕様駆動の夢を見ない](https://speakerdeck.com/gotalab555/claude-codehashi-yang-qu-dong-nomeng-wojian-nai) - Speaker Deck Presentation (Japanese)

🔗 **External Resources**
- [Kiro IDE](https://kiro.dev) - Enhanced spec management and team collaboration
- [Kiro's Spec Methodology](https://kiro.dev/docs/specs/) - Proven spec-driven development methodology
- [AI-Assisted SDD: Spec-Driven Development with Gemini, Claude, and cc-sdd](https://www.amazon.com/dp/B0CW19YX9R) - Comprehensive book available on Amazon
- [AI支援SDD: Gemini、Claude、cc-sddを使ったスペック駆動開発](https://www.amazon.co.jp/dp/B0G5J4N9NM) - 日本語版も Amazon で販売中

## 📦 Package Information

This repository contains the **cc-sdd** NPM package located in [`tools/cc-sdd/`](tools/cc-sdd/).

For detailed documentation, installation instructions, and usage examples, see:
- [**Tool Documentation**](tools/cc-sdd/README.md) - Complete cc-sdd tool guide
- [**Japanese Documentation**](tools/cc-sdd/README_ja.md) - 日本語版ツール説明


## License

MIT License
