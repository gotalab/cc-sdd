# cc-sdd: Customize spec-driven development for your team's workflow

✨ **Transform Claude Code / Cursor IDE / Gemini CLI / Codex CLI / GitHub Copilot / Qwen Code / Windsurf from prototype to production-ready development, while customizing every spec and steering template so requirements, design docs, tasks, and project memory match your team workflow.**

<!-- npm badges -->
[![npm version](https://img.shields.io/npm/v/cc-sdd?logo=npm)](https://www.npmjs.com/package/cc-sdd?activeTab=readme)
[![npm (next)](https://img.shields.io/npm/v/cc-sdd/next?logo=npm)](https://www.npmjs.com/package/cc-sdd?activeTab=versions)
[![install size](https://packagephobia.com/badge?p=cc-sdd)](https://packagephobia.com/result?p=cc-sdd)
[![license: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

<div align="center" style="margin-bottom: 1rem; font-size: 1.2rem;"><sub>
English | <a href="https://github.com/gotalab/cc-sdd/blob/main/tools/cc-sdd/README_ja.md">日本語</a> | <a href="https://github.com/gotalab/cc-sdd/blob/main/tools/cc-sdd/README_zh-TW.md">繁體中文</a>
</sub></div>

Brings **AI-DLC (AI Driven Development Lifecycle)** to Claude Code, Cursor IDE, Gemini CLI, Codex CLI, GitHub Copilot, Qwen Code, and Windsurf. **AI-native processes** with **minimal human approval gates**: AI drives execution while humans validate critical decisions at each phase.

🎯 **Perfect for**: Escaping the 70% overhead trap of traditional development (meetings, documentation, ceremonies) to achieve **weeks-to-hours delivery** with AI-native execution and human quality gates.

> **Kiro compatible** — Same or even better proven workflow used in professional environments.

## 🚀 Installation

Choose your preferred installation method:

### Option 1: Claude Plugins Marketplace (Recommended)

Install cc-sdd as a Claude plugins marketplace for modular, standards-compliant installation:

```bash
# Add the cc-sdd marketplace
claude /plugin marketplace add https://github.com/gotalab/cc-sdd

# Install specific plugins for your AI agent
claude /plugin install cc-sdd-claude-code     # For Claude Code
claude /plugin install cc-sdd-claude-agent    # For Claude Code SubAgents
claude /plugin install cc-sdd-cursor          # For Cursor IDE
claude /plugin install cc-sdd-gemini          # For Gemini CLI
claude /plugin install cc-sdd-codex           # For Codex CLI
claude /plugin install cc-sdd-copilot         # For GitHub Copilot
claude /plugin install cc-sdd-qwen            # For Qwen Code
```

### Option 2: Traditional CLI Installation

Run one command to install **AI-DLC** (AI Driven Development Lifecycle) with **SDD** (Spec-Driven Development) workflows across your preferred AI coding agent. cc-sdd also scaffolds team-aligned templates so generated requirements, design reviews, task plans, and steering docs fit your approval flow.

```bash
# Basic installation (defaults: English docs, Claude Code)
npx cc-sdd@latest

# Alpha version with major updates (v2.0.0-alpha.3)
npx cc-sdd@next

# With language options (default: --lang en)
npx cc-sdd@latest --lang ja    # Japanese
npx cc-sdd@latest --lang zh-TW # Traditional Chinese
# Supported languages (12 total): en, ja, zh-TW, zh, es, pt, de, fr, ru, it, ko, ar

# With agent options (default: claude-code / --claude)
npx cc-sdd@latest --claude --lang ja    # or @next for latest alpha
npx cc-sdd@next --claude-agent --lang ja # Install Claude Code SubAgents (requires @next)
npx cc-sdd@latest --gemini --lang ja    # or @next for latest alpha
npx cc-sdd@latest --cursor --lang ja    # or @next for latest alpha
npx cc-sdd@next --codex --lang ja       # Requires alpha version
npx cc-sdd@next --copilot --lang ja     # Requires alpha version
npx cc-sdd@latest --qwen --lang ja      # or @next for latest alpha
npx cc-sdd@next --windsurf --lang ja    # Requires alpha version (Windsurf workflows)
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

## ✨ Key Features

- **🚀 AI-DLC Methodology** - AI-native processes with human approval. Core pattern: AI executes, human validates
- **📋 Spec-First Development** - Comprehensive specifications as single source of truth driving entire lifecycle
- **⚡ "Bolts" not Sprints** - [AI-DLC terminology](https://aws.amazon.com/jp/blogs/news/ai-driven-development-life-cycle/) for intensive hours/days cycles replacing weeks-long sprints. Escape the 70% administrative overhead
- **🧠 Persistent Project Memory** - AI maintains comprehensive context (architecture, patterns, rules, domain knowledge) across all sessions via steering documents  
- **🛠 Template flexibility** - Tweak `{{KIRO_DIR}}/settings/templates` (steering, requirements, design, tasks) to mirror your team's deliverables
- **🔄 AI-Native + Human Gates** - AI Plans → AI Asks → Human Validates → AI Implements (rapid cycles with quality control)
- **🌍 Team-Ready** - 12-language support, cross-platform, standardized workflows with quality gates
- **🏪 Claude Plugins Standard** - Now available as a proper Claude plugins marketplace for modular installation

## 🏪 Claude Plugins Marketplace

cc-sdd now follows the official Claude plugins specification, providing a marketplace-based installation experience:

- **Modular Installation**: Install only the plugins you need for your specific AI agent
- **Standards Compliant**: Follows Claude's official plugin architecture
- **Easy Updates**: Marketplace-based distribution enables seamless updates
- **Plugin Isolation**: Each agent type is a separate plugin with its own settings and commands

### Marketplace Installation

```bash
# Add the marketplace
claude /plugin marketplace add https://github.com/gotalab/cc-sdd

# Browse available plugins
claude /plugin marketplace list

# Install specific plugins
claude /plugin install cc-sdd-claude-code
```

> **Note**: The traditional `npx cc-sdd` CLI installation remains fully supported for backward compatibility.

## 🤖 Supported AI Agents

| Agent | Status | Plugin | Commands |  |
|-------|--------|--------|----------|--------|
| **Claude Code** | ✅ Full | `cc-sdd-claude-code` | 11 slash commands | `CLAUDE.md` |
| **Claude Code SubAgents** | ✅ Full | `cc-sdd-claude-agent` | 12 commands + 9 subagents | `CLAUDE.md`, `.claude/agents/kiro/` |
| **Gemini CLI** | ✅ Full | `cc-sdd-gemini` | 11 commands | `GEMINI.md` |
| **Cursor IDE** | ✅ Full | `cc-sdd-cursor` | 11 commands | `AGENTS.md` |
| **Codex CLI** | ✅ Full | `cc-sdd-codex` | 11 prompts | `AGENTS.md` |
| **GitHub Copilot** | ✅ Full | `cc-sdd-copilot` | 11 prompts | `AGENTS.md` |
| **Qwen Code** | ✅ Full | `cc-sdd-qwen` | 11 commands | `QWEN.md` |
| Others | 📅 Planned | - | - | - |
 
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

### Marketplace Installation Structure

When using Claude plugins marketplace installation:

```
project/
├── .claude/plugins/cc-sdd-claude-code/     # Claude Code plugin
│   ├── .claude-plugin/plugin.json          # Plugin metadata
│   ├── commands/                           # 11 slash commands
│   └── .claude-plugin/settings/            # Rules & templates
├── .claude/plugins/cc-sdd-claude-agent/    # Claude SubAgents plugin
│   ├── .claude-plugin/plugin.json
│   ├── commands/                           # 12 commands
│   ├── agents/                             # 9 subagents
│   └── .claude-plugin/settings/
├── .kiro/specs/                            # Feature specifications
├── .kiro/steering/                         # AI guidance rules
└── CLAUDE.md                                # Project configuration
```

### Traditional CLI Installation Structure

When using `npx cc-sdd` installation:

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

## 📚 Documentation & Support

- **[Complete Documentation](https://github.com/gotalab/cc-sdd/tree/main/docs)** - Setup guides and references
- **[Command Reference](https://github.com/gotalab/cc-sdd/blob/main/docs/guides/command-reference.md)** - All `/kiro:*` commands with detailed usage, parameters, examples
- **[Customization Guide](https://github.com/gotalab/cc-sdd/blob/main/docs/guides/customization-guide.md)** - 7 practical examples: PRD requirements, frontend/backend designs, approval workflows, JIRA integration, domain steering
- **[Issues & Support](https://github.com/gotalab/cc-sdd/issues)** - Bug reports and questions
- **[Kiro IDE](https://kiro.dev)**

---

**Beta Release** - Ready to use, actively improving. [Report issues](https://github.com/gotalab/cc-sdd/issues) | MIT License

### Platform Support
- Supported OS: macOS, Linux, Windows (auto-detected by default).
- Unified command templates across operating systems; `--os` override is optional for legacy automation.

> **Heads-up:** Passing `--os` still works for backward compatibility, but all platforms now receive the same command set.
