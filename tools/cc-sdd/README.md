# cc-sdd: Spec-driven development for your team's workflow

[![npm version](https://img.shields.io/npm/v/cc-sdd?logo=npm)](https://www.npmjs.com/package/cc-sdd?activeTab=readme)
[![install size](https://packagephobia.com/badge?p=cc-sdd)](https://packagephobia.com/result?p=cc-sdd)
[![license: MIT](https://img.shields.io/badge/license-MIT-green.svg)](../../LICENSE)

<div align="center" style="margin-bottom: 1rem; font-size: 1.1rem;"><sub>
English | <a href="./README_ja.md">日本語</a> | <a href="./README_zh-TW.md">繁體中文</a>
</sub></div>

✨ **Transform Claude Code / Cursor IDE / Gemini CLI / Codex CLI / GitHub Copilot / Qwen Code / Windsurf from prototype to production-ready development.**

👻 **Kiro-inspired** — Similar Spec-Driven, AI-DLC style as Kiro IDE, so existing Kiro specs remain compatible and portable.

**What's New in v2.0.0:**
- ✅ **Fast-to-Review Designs** — Structured format with summary tables makes reviews 5x faster
- ✅ **Separate Research** — Keep discovery notes (Research.md) separate from final design (Design.md)
- ✅ **Quality Gates** — validate-gap/design/impl commands catch integration issues before coding
- ✅ **Customize Once** — Adapt templates to your team's process; all agents follow the same workflow
- ✅ **Universal Workflow** — 7 agents × 12 languages share the same 11-command process

---

> Need the legacy flow? Use `npx cc-sdd@1.1.5`. Upgrading from v1.x?
> See the Migration Guide: [English](../../docs/guides/migration-guide.md) | [日本語](../../docs/guides/ja/migration-guide.md).

## 🚀 Installation

Run one command to install **AI-DLC** (AI Driven Development Lifecycle) with **SDD** (Spec-Driven Development) workflows across your preferred AI coding agent. cc-sdd also scaffolds team-aligned templates so generated requirements, design reviews, task plans, and steering docs fit your approval flow.

```bash
# Basic installation (defaults: English docs, Claude Code)
npx cc-sdd@latest

# With language options (default: --lang en)
npx cc-sdd@latest --lang ja    # Japanese
npx cc-sdd@latest --lang zh-TW # Traditional Chinese
npx cc-sdd@latest --lang es    # Spanish
... (en, ja, zh-TW, zh, es, pt, de, fr, ru, it, ko, ar supported)

# With agent options (default: claude-code / --claude)
npx cc-sdd@latest --claude        # Claude Code (11 commands, en/ja/zh-TW/...)
npx cc-sdd@latest --claude-agent --lang ja  # Claude Code Subagents (12 commands + 9 subagents)
npx cc-sdd@latest --cursor --lang zh-TW     # Cursor IDE (choose any supported lang)
npx cc-sdd@latest --gemini --lang es        # Gemini CLI
npx cc-sdd@latest --codex --lang fr         # Codex CLI
npx cc-sdd@latest --copilot --lang pt       # GitHub Copilot
npx cc-sdd@latest --qwen --lang de          # Qwen Code
npx cc-sdd@latest --windsurf --lang ja      # Windsurf IDE

# Note: @next is now reserved for future alpha/beta versions
```

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

## ✨ Quick Start

### For New Projects
```bash
# Launch AI agent and start spec-driven development immediately
/kiro:spec-init Build a user authentication system with OAuth  # AI creates structured plan
/kiro:spec-requirements auth-system                            # AI asks clarifying questions
/kiro:spec-design auth-system                                  # Human validates, AI designs
/kiro:spec-tasks auth-system                                   # Break into implementation tasks
/kiro:spec-impl auth-system                                    # Execute with TDD
```

![design.md - System Flow Diagram](https://raw.githubusercontent.com/gotalab/cc-sdd/refs/heads/main/assets/design-system_flow.png)
*Example of system flow during the design phase `design.md`*

### For Existing Projects (Recommended)
```bash
# First establish project context, then proceed with development
/kiro:steering                                                 # AI learns existing project context

/kiro:spec-init Add OAuth to existing auth system              # AI creates enhancement plan
/kiro:spec-requirements oauth-enhancement                      # AI asks clarifying questions
/kiro:validate-gap oauth-enhancement                           # Optional: Analyze existing vs requirements
/kiro:spec-design oauth-enhancement                            # Human validates, AI designs
/kiro:validate-design oauth-enhancement                        # Optional: Validate design integration  
/kiro:spec-tasks oauth-enhancement                             # Break into implementation tasks
/kiro:spec-impl oauth-enhancement                              # Execute with TDD
```

**30-second setup** → **AI-driven "bolts" (not sprints)** → **Hours-to-delivery results**

### Why teams install cc-sdd
1. **Single source specs** – requirements, design, tasks, and supporting references stay in sync, so reviewers approve faster.
2. **Greenfield or brownfield** – net-new features boot in minutes, while validate gates and project memory keep legacy upgrades safe.
3. **Mix any agent** – the same templates and rules power Claude, Cursor, Codex, Gemini, Copilot, Qwen, and Windsurf simultaneously.
4. **Customize once** – edit `.kiro/settings/templates/` or `.kiro/settings/rules/` and every agent/slash command reflects your workflow.

## ✨ Key Features

- **🚀 AI-DLC Methodology** - AI-native processes with human approval. Core pattern: AI executes, human validates
- **📋 Spec-First Development** - Comprehensive specifications as single source of truth driving entire lifecycle
- **⚡ "Bolts" not Sprints** - [AI-DLC terminology](https://aws.amazon.com/jp/blogs/news/ai-driven-development-life-cycle/) for intensive hours/days cycles replacing weeks-long sprints. Escape the 70% administrative overhead
- **🧠 Persistent Project Memory** - AI maintains comprehensive context (architecture, patterns, rules, domain knowledge) across all sessions via steering documents  
- **🛠 Template flexibility** - Tweak `{{KIRO_DIR}}/settings/templates` (steering, requirements, design, tasks) to mirror your team's deliverables
- **🔄 AI-Native + Human Gates** - AI Plans → AI Asks → Human Validates → AI Implements (rapid cycles with quality control)
- **🌍 Team-Ready** - 12-language support, cross-platform, standardized workflows with quality gates

## 🤖 Supported AI Agents

| Agent | Status | Commands |
|-------|--------|----------|
| **Claude Code** | ✅ Full | 11 slash commands |
| **Claude Code Subagents** | ✅ Full | 12 commands + 9 subagents |
| **Cursor IDE** | ✅ Full | 11 commands |
| **Gemini CLI** | ✅ Full | 11 commands |
| **Codex CLI** | ✅ Full | 11 prompts |
| **GitHub Copilot** | ✅ Full | 11 prompts |
| **Qwen Code** | ✅ Full | 11 commands |
| **Windsurf IDE** | ✅ Full | 11 workflows |
| Others (Factory AI Droid) | 📅 Planned | - |
 
## 📋 Commands

### Spec-Driven Development Workflow (Specs Methodology)
```bash
/kiro:spec-init <description>             # Initialize feature spec
/kiro:spec-requirements <feature_name>    # Generate requirements
/kiro:spec-design <feature_name>          # Create technical design  
/kiro:spec-tasks <feature_name>           # Break into implementation tasks
/kiro:spec-impl <feature_name> <tasks>    # Execute with TDD
/kiro:spec-status <feature_name>          # Check progress
```

> **Specifications as the Foundation**: Based on [Kiro's specs](https://kiro.dev/docs/specs/) - specs transform ad-hoc development into systematic workflows, bridging ideas to implementation with clear AI-human collaboration points.

> **Kiro IDE Integration**: Specs are portable to [Kiro IDE](https://kiro.dev) for enhanced implementation with guardrails and team collaboration features.

📖 **[Complete Command Reference](https://github.com/gotalab/cc-sdd/blob/main/docs/guides/command-reference.md)** - Detailed usage, parameters, examples, and troubleshooting for all commands

### Quality Validation (Optional - Brownfield Development)
```bash
# Before spec-design (analyze existing functionality vs requirements):
/kiro:validate-gap <feature_name>         # Analyze existing functionality and identify gaps with requirements

# After spec-design (validate design against existing system):
/kiro:validate-design <feature_name>      # Review design compatibility with existing architecture
```

> **Optional for Brownfield Development**: `validate-gap` analyzes existing vs required functionality; `validate-design` checks integration compatibility. Both are optional quality gates for existing systems.

### Project Memory & Context (Essential)
```bash
/kiro:steering                            # Create/update project memory and context
/kiro:steering-custom                     # Add specialized domain knowledge
```

> **Critical Foundation Commands**: Steering creates persistent project memory - context, rules, and architecture that AI uses across all sessions. **Run first for existing projects** to dramatically improve spec quality.

## 🎨 Customization

Edit templates in `{{KIRO_DIR}}/settings/templates/` to match your workflow. Keep the core structure (requirement numbers, checkboxes, headings) and add your team's context—AI adapts automatically.

**Common customizations**:
- **PRD-style requirements** with business context and success metrics
- **Frontend/Backend designs** optimized for React components or API specs
- **Approval gates** for security, architecture, or compliance reviews
- **JIRA/Linear-ready tasks** with estimation, priority, and labels
- **Domain steering** for API standards, testing conventions, or coding guidelines

📖 **[Customization Guide](https://github.com/gotalab/cc-sdd/blob/main/docs/guides/customization-guide.md)** — 7 practical examples with copy-paste snippets


## ⚙️ Configuration

```bash
# Language and platform
npx cc-sdd@latest --lang ja            # macOS / Linux / Windows (auto-detected)
npx cc-sdd@latest --lang ja --os mac   # Optional explicit override (legacy flag)

# Safe operations  
npx cc-sdd@latest --dry-run --backup

# Custom directory
npx cc-sdd@latest --kiro-dir docs/specs
```

## 📁 Project Structure

After installation, your project gets:

```
project/
├── .claude/commands/kiro/    # 11 slash commands
├── .codex/prompts/           # 11 prompt commands (Codex CLI)
├── .github/prompts/          # 11 prompt commands (GitHub Copilot)
├── .windsurf/workflows/      # 11 workflow files (Windsurf IDE)
├── .kiro/settings/           # Shared rules & templates (variables resolved with {{KIRO_DIR}})
├── .kiro/specs/              # Feature specifications
├── .kiro/steering/           # AI guidance rules
└── CLAUDE.md (Claude Code)    # Project configuration
```

> Note: only the directories for the agent(s) you install will be created. The tree above shows the full superset for reference.

## 📚 Documentation & Support

- Command Reference: [English](../../docs/guides/command-reference.md) | [日本語](../../docs/guides/ja/command-reference.md)
- Customization Guide: [English](../../docs/guides/customization-guide.md) | [日本語](../../docs/guides/ja/customization-guide.md)
- Spec-Driven Guide: [English](../../docs/guides/spec-driven.md) | [日本語](../../docs/guides/ja/spec-driven.md)
- Claude Subagents Guide: [English](../../docs/guides/claude-subagents.md) | [日本語](../../docs/guides/ja/claude-subagents.md)
- Migration Guide: [English](../../docs/guides/migration-guide.md) | [日本語](../../docs/guides/ja/migration-guide.md)
- **[Issues & Support](https://github.com/gotalab/cc-sdd/issues)** - Bug reports and questions
- **[Kiro IDE](https://kiro.dev)**

---

**Stable Release v2.0.0** - Production-ready. [Report issues](https://github.com/gotalab/cc-sdd/issues) | MIT License

### Platform Support
- Supported OS: macOS, Linux, Windows (auto-detected by default).
- Unified command templates across operating systems; `--os` override is optional for legacy automation.

> **Heads-up:** Passing `--os` still works for backward compatibility, but all platforms now receive the same command set.
