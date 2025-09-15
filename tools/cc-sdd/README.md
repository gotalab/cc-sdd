# cc-sdd

✨ **Transform Claude Code/ Cursor IDE / Gemini CLI from prototype to production-ready development**

<!-- npm badges -->
[![npm version](https://img.shields.io/npm/v/cc-sdd?logo=npm)](https://www.npmjs.com/package/cc-sdd?activeTab=readme)
[![install size](https://packagephobia.com/badge?p=cc-sdd)](https://packagephobia.com/result?p=cc-sdd)
[![license: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

<div align="center" style="margin-bottom: 1rem; font-size: 1.2rem;"><sub>
English | <a href="https://github.com/gotalab/cc-sdd/blob/main/tools/cc-sdd/README_ja.md">日本語</a> | <a href="https://github.com/gotalab/cc-sdd/blob/main/tools/cc-sdd/README_zh-TW.md">繁體中文</a>
</sub></div>

Brings **AI-DLC (AI Driven Development Lifecycle)** to Claude Code, Cursor IDE and Gemini CLI. **AI-native processes** with **minimal human approval gates**: AI drives execution while humans validate critical decisions at each phase.

🎯 **Perfect for**: Escaping the 70% overhead trap of traditional development (meetings, documentation, ceremonies) to achieve **weeks-to-hours delivery** with AI-native execution and human quality gates.

> **Kiro compatible** — Same proven workflow used in professional environments.

## 🚀 Installation

```bash
# Basic installation (defaults: English docs, Claude Code agent)
npx cc-sdd@latest

# With language options (default: --lang en)
npx cc-sdd@latest --lang ja    # Japanese
npx cc-sdd@latest --lang zh-TW # Traditional Chinese
# Supported languages: en, ja, zh-TW, zh, es, pt, de, fr, ru, it, ko, ar

# With agent options (default: claude-code)
npx cc-sdd@latest --gemini-cli --lang ja # For Gemini CLI instead
npx cc-sdd@latest --cursor --lang ja # For Cursor IDE instead
```

## 🌐 Supported Languages

- English (`en`)
- Japanese (`ja`)
- Traditional Chinese (`zh-TW`)
- Chinese (`zh`)
- Spanish (`es`)
- Portuguese (`pt`)
- German (`de`)
- French (`fr`)
- Russian (`ru`)
- Italian (`it`)
- Korean (`ko`)
- Arabic (`ar`)

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
- **🔄 AI-Native + Human Gates** - AI Plans → AI Asks → Human Validates → AI Implements (rapid cycles with quality control)
- **🌍 Team-Ready** - Multi-language, cross-platform, standardized workflows with quality gates

## 🤖 Supported AI Agents

| Agent | Status | Commands | Config |
|-------|--------|----------|--------|
| **Claude Code** | ✅ Full | 10 slash commands | `CLAUDE.md` |
| **Gemini CLI** | ✅ Full | 10 commands | `GEMINI.md` |
| **Cursor IDE** | ✅ Full | 10 commands | `AGENTS.md` |
| Others | 📅 Planned | - | - |
 
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

## ⚙️ Configuration

```bash
# Language and platform
npx cc-sdd@latest --lang ja --os mac   # macOS
npx cc-sdd@latest --lang ja --os linux # Linux (shares mac templates)

# Safe operations  
npx cc-sdd@latest --dry-run --backup

# Custom directory
npx cc-sdd@latest --kiro-dir docs/specs
```

## 📁 Project Structure

After installation, your project gets:

```
project/
├── .claude/commands/kiro/    # 10 slash commands
├── .kiro/specs/              # Feature specifications
├── .kiro/steering/           # AI guidance rules
└── CLAUDE.md (Claude Code)    # Project configuration
```

## 📚 Documentation & Support

- **[Full Documentation](https://github.com/gotalab/cc-sdd/tree/main/docs/README)** - Complete setup guide
- **[Command Reference](https://github.com/gotalab/cc-sdd/docs)** - All options and examples  
- **[Issues & Support](https://github.com/gotalab/cc-sdd/issues)** - Bug reports and questions
- **[Kiro IDE](https://kiro.dev)**

---

**Beta Release** - Ready to use, actively improving. [Report issues](https://github.com/gotalab/cc-sdd/issues) | MIT License

### Platform Support
- Supported OS: macOS, Linux, Windows (auto-detected by default).
- Linux uses the same command templates as macOS. Windows has dedicated templates.
