# cc-sdd: Long-running spec-driven implementation for AI coding agents

<!-- npm badges -->
[![npm version](https://img.shields.io/npm/v/cc-sdd?logo=npm)](https://www.npmjs.com/package/cc-sdd?activeTab=readme)
[![install size](https://packagephobia.com/badge?p=cc-sdd)](https://packagephobia.com/result?p=cc-sdd)
[![license: MIT](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)

<div align="center" style="font-size: 1.1rem; margin-bottom: 1rem;"><sub>
<a href="./tools/cc-sdd/README.md">English</a> | <a href="./tools/cc-sdd/README_ja.md">日本語</a> | <a href="./tools/cc-sdd/README_zh-TW.md">繁體中文</a>
</sub></div>

## Turn approved specs into long-running autonomous implementation

**One command. Specs become executable work: Requirements → Design → Tasks → Autonomous implementation with adversarial review. Minimal, adaptable, cross-agent portable.**

👻 **Kiro-inspired** — Similar Spec-Driven, AI-DLC style as Kiro IDE, so existing Kiro specs remain compatible and portable.

cc-sdd turns approved specs into executable work instead of leaving them as passive documents. It brings structured **AI-DLC** (AI-Driven Development Lifecycle) and **Spec-Driven Development** to Claude Code, Cursor, Gemini CLI, Codex CLI, GitHub Copilot, Qwen Code, OpenCode, and Windsurf, with native subagent-driven autonomous implementation for larger approved task sets.

### What you get:
- ✅ **Approved specs become executable work** — Requirements, design, tasks, implementation, review, and final validation stay connected instead of drifting apart
- ✅ **Long-running autonomous implementation** — Large approved task sets run autonomously with per-task subagent dispatch, TDD with Feature Flag Protocol, independent adversarial review, and auto-debug on failure, no external dependencies
- ✅ **Review and final validation flows are built in** — The system is designed to re-check work, remediate concrete findings, and stop honestly when work is blocked or not ready to claim complete
- ✅ **Team-aligned templates keep adoption practical** — Customize once and generated requirements, design reviews, tasks, and steering docs fit your approval process

### Core ideas
- **Boundary-first** — Specs are most useful when they make responsibility boundaries and contracts explicit enough that teams and agents can work independently.
- **Spec-centered, mechanically grounded** — Markdown specs carry intent, scope, and boundaries, while tests, builds, linting, and runtime checks keep that intent connected to reality.
- **Change-friendly by design** — cc-sdd stays intentionally simple and customizable so teams can adapt templates, rules, and workflows to fit their own operating model.
- **Autonomy with explicit stopping points** — `/kiro-impl` can execute `tasks.md` task by task through TDD and review, but it is designed to stop when human approval, clarification, or judgment is genuinely needed.

### Why Agent Skills matter:
- Agent Skills package workflow instructions, domain knowledge, playbooks, and tool restrictions into composable units instead of scattering them across ad hoc docs
- The same skills-based workflow works across Claude Code, Codex, Cursor, Copilot, Windsurf, OpenCode, Gemini CLI, and Antigravity
- Skills modes (`--claude-skills`, `--codex-skills`, `--cursor-skills`, etc.) are the recommended installs -- legacy command modes will be removed in a future release

## 🚀 Quick Start

```bash
# Run in your project root directory
cd your-project
npx cc-sdd@latest

# Default install targets Claude Code Skills.
# Choose a different agent with flags like --codex-skills, --cursor-skills, or --windsurf-skills.
```

Then start with one of these:

```bash
/kiro-discovery <idea>                # Skills mode: the safest entry point for any new work
/kiro:spec-init <what-to-build>       # Legacy mode: direct entry point
```

If you are using skills mode and are not sure where to start, start with `kiro-discovery`.

### Common workflows

| You want to... | Skills mode | Legacy mode |
|----------|----------|----------|
| Start a new feature or product-sized idea | `kiro-discovery` → `kiro-spec-init` → `kiro-spec-requirements` → `kiro-spec-design` → `kiro-spec-tasks` → `kiro-impl` | `kiro:spec-init` → `kiro:spec-requirements` → `kiro:spec-design` → `kiro:spec-tasks` → `kiro:spec-impl` |
| Extend an existing system | `kiro:steering` → `kiro-discovery` or `kiro:spec-init` → optional `kiro:validate-gap` → `kiro-spec-design` → `kiro-spec-tasks` → `kiro-impl` | `kiro:steering` → `kiro:spec-init` → optional `kiro:validate-gap` → `kiro:spec-design` → `kiro:spec-tasks` → `kiro:spec-impl` |
| Break down a large initiative | `kiro-discovery` → `kiro-spec-batch` | Not available |
| Implement a small change with no spec | `kiro-discovery` → direct implementation | Direct implementation |

For larger approved task sets, run `kiro-impl` to start autonomous implementation with per-task subagent dispatch, review, and final validation gates.

**Installation takes 30 seconds.** 8 skills-based agents (Claude, Codex, Cursor, Copilot, Windsurf, OpenCode, Gemini CLI, Antigravity) × 13 languages. Legacy command modes also available but deprecated.

📖 **Next steps:** [All installation options](#%EF%B8%8F-advanced-installation) | [Skill Reference](docs/guides/skill-reference.md) | [Command Reference](docs/guides/command-reference.md) | [Spec-Driven Guide](docs/guides/spec-driven.md)

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

## 🎯 Workflow Entry Points

| Scenario | Workflow |
|----------|----------|
| **New work (feature to initiative)** | Skills mode: `discovery` → `spec-init` → `spec-requirements` → `spec-design` → `spec-tasks` → `kiro-impl`; legacy: `spec-init` → `spec-requirements` → `spec-design` → `spec-tasks` |
| **Enhance existing code (brownfield)** | Skills mode: `steering` → `discovery` or `spec-init` → optional `validate-gap` → `spec-design` → optional `validate-design` → `spec-tasks` → `kiro-impl`; legacy: `steering` → `spec-init` → optional `validate-gap` → `spec-design` → optional `validate-design` → `spec-tasks` |
| **Discovery and scoping** | Skills mode only: `discovery` → route the work, refine scope, and write `brief.md` / `roadmap.md` → stop with the correct next command |
| **Batch spec generation** | `spec-batch` → generate requirements, design, and tasks in one pass from roadmap-driven briefs |
| **Team process alignment** | Customize templates once in `.kiro/settings/templates/` → all agents follow the same workflow |

### After Discovery

`kiro-discovery` is the entry point for new work in skills mode. It should help the user answer one question first: "What should happen next?" After routing the work and writing persistent files, it should stop.

- Existing spec: continue with `kiro-spec-requirements {feature}`
- No spec needed: implement directly
- Single spec: default to `kiro-spec-init <feature>`; use `kiro-spec-quick <feature>` only when you intentionally want the fast path
- Multi-spec: default to `kiro-spec-batch`; use `kiro-spec-init <first-feature>` first if you want to validate one slice before batching the rest
- Mixed decomposition: let discovery separate existing-spec updates, new specs, and direct-implementation candidates before choosing the next step

## 🎨 Customization

Customize templates and rules in `{{KIRO_DIR}}/settings/` to match your team's workflow:

- **templates/** - Define document structure (requirements, design, tasks)
- **rules/** - Define AI generation principles and judgment criteria

Common use cases: PRD-style requirements, API/database schemas, approval gates, JIRA integration, domain-specific standards.

📖 **[Customization Guide](docs/guides/customization-guide.md)** — Complete guide with practical examples

## ⚙️ Advanced Installation

### Choose Your Agent (Skills Mode — Recommended)

```bash
npx cc-sdd@latest                     # Claude Code Skills (default, 17 skills)
npx cc-sdd@latest --claude-skills     # Claude Code Skills
npx cc-sdd@latest --codex-skills      # Codex CLI Skills (17 skills)
npx cc-sdd@latest --cursor-skills     # Cursor IDE Skills (17 skills)
npx cc-sdd@latest --copilot-skills    # GitHub Copilot Skills (17 skills)
npx cc-sdd@latest --windsurf-skills   # Windsurf IDE Skills (17 skills)
npx cc-sdd@latest --opencode-skills   # OpenCode Skills (17 skills)
npx cc-sdd@latest --gemini-skills     # Gemini CLI Skills (17 skills)
npx cc-sdd@latest --antigravity       # Antigravity Skills (17 skills)
```

### Legacy Modes (Deprecated — will be removed)

```bash
npx cc-sdd@latest --claude         # Claude Code commands (use --claude-skills)
npx cc-sdd@latest --claude-agent   # Claude Code subagents (use --claude-skills)
npx cc-sdd@latest --cursor         # Cursor IDE commands (use --cursor-skills)
npx cc-sdd@latest --copilot        # GitHub Copilot prompts (use --copilot-skills)
npx cc-sdd@latest --windsurf       # Windsurf IDE workflows (use --windsurf-skills)
npx cc-sdd@latest --opencode       # OpenCode commands (use --opencode-skills)
npx cc-sdd@latest --opencode-agent # OpenCode subagents (use --opencode-skills)
npx cc-sdd@latest --gemini         # Gemini CLI commands (use --gemini-skills)
npx cc-sdd@latest --codex          # Codex CLI (blocked, use --codex-skills)
npx cc-sdd@latest --qwen           # Qwen Code
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
| **Skill Reference** | Skills-mode workflow, supporting skills, and when to use each one | [English](docs/guides/skill-reference.md) \| [日本語](docs/guides/ja/skill-reference.md) |
| **Command Reference** | Legacy `/kiro:*` commands with detailed usage, parameters, and examples | [English](docs/guides/command-reference.md) \| [日本語](docs/guides/ja/command-reference.md) |
| **Customization Guide** | 7 practical examples: PRD requirements, frontend/backend designs, JIRA integration | [English](docs/guides/customization-guide.md) \| [日本語](docs/guides/ja/customization-guide.md) |
| **Spec-Driven Guide** | Complete workflow methodology from requirements to implementation | [English](docs/guides/spec-driven.md) \| [日本語](docs/guides/ja/spec-driven.md) |
| **Claude Subagents** | Advanced: Using 9 specialized subagents for complex projects | [English](docs/guides/claude-subagents.md) \| [日本語](docs/guides/ja/claude-subagents.md) |
| **Migration Guide** | Upgrading from v1.x to v3.0.0 | [English](docs/guides/migration-guide.md) \| [日本語](docs/guides/ja/migration-guide.md) |

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

## 📦 Package Information

This repository contains the **cc-sdd** NPM package located in [`tools/cc-sdd/`](tools/cc-sdd/).

For detailed documentation, installation instructions, and usage examples, see:
- [**Tool Documentation**](tools/cc-sdd/README.md) - Complete cc-sdd tool guide
- [**Japanese Documentation**](tools/cc-sdd/README_ja.md) - 日本語版ツール説明


## License

MIT License
