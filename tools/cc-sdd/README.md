# cc-sdd: Long-running spec-driven implementation for AI coding agents

[![npm version](https://img.shields.io/npm/v/cc-sdd?logo=npm)](https://www.npmjs.com/package/cc-sdd?activeTab=readme)
[![install size](https://packagephobia.com/badge?p=cc-sdd)](https://packagephobia.com/result?p=cc-sdd)
[![license: MIT](https://img.shields.io/badge/license-MIT-green.svg)](../../LICENSE)

<div align="center" style="margin-bottom: 1rem; font-size: 1.1rem;"><sub>
English | <a href="./README_ja.md">日本語</a> | <a href="./README_zh-TW.md">繁體中文</a>
</sub></div>

✨ **Turn approved specs into long-running autonomous implementation. A minimal, adaptable SDD harness.**

👻 **Kiro-inspired** — Spec-Driven, AI-DLC style compatible with Kiro IDE. Existing Kiro specs remain portable.

cc-sdd turns approved specs into executable work: requirements → design → tasks → autonomous implementation with adversarial review and final validation. Specs are not documents to read -- they are the control plane that drives each phase.

**Why cc-sdd:**
- ✅ **Specs you can run** — Each artifact (requirements, design, tasks) directly controls the next phase. File Structure Plan drives task boundaries. Task Brief drives implementation. git diff drives review.
- ✅ **Long-running autonomous implementation** — `/kiro-impl` runs all tasks with fresh subagent per task, independent adversarial reviewer, and Feature Flag TDD. No external dependencies.
- ✅ **Scales to real products** — `/kiro-brainstorm` decomposes large ideas into multiple specs with dependency ordering. `/kiro-spec-batch` creates all specs in parallel with cross-spec consistency review.
- ✅ **Customize once, adapt as models improve** — 14 skills, shared rules as single source of truth. Team-aligned templates fit your approval process. As models improve, lighten the harness -- the design makes that easy.

**Why Agent Skills:**
- Skills package workflow as composable units that load on demand (progressive disclosure)
- Same skills-based workflow works across Claude Code, Codex, Cursor, Copilot, Windsurf, OpenCode, Gemini CLI, and Antigravity
- Skills modes are the recommended installs -- legacy command modes will be removed in a future release

> Specs are not passive documents. Approved specs become executable work.

---

> Need the legacy flow? Use `npx cc-sdd@1.1.5`. Upgrading from v1.x?
> See the Migration Guide: [English](../../docs/guides/migration-guide.md) | [日本語](../../docs/guides/ja/migration-guide.md).

## 🚀 Installation

Run one command to install **AI-DLC** (AI Driven Development Lifecycle) with **SDD** (Spec-Driven Development) workflows across your preferred AI coding agent. cc-sdd also scaffolds team-aligned templates so generated requirements, design reviews, task plans, steering docs, and long-running implementation loops fit your approval flow.

```bash
# Basic installation (defaults: English docs, Claude Code Skills)
npx cc-sdd@latest

# With language options (default: --lang en)
npx cc-sdd@latest --lang ja    # Japanese
npx cc-sdd@latest --lang zh-TW # Traditional Chinese
npx cc-sdd@latest --lang es    # Spanish
... (en, ja, zh-TW, zh, es, pt, de, fr, ru, it, ko, ar, el supported)

# With agent options (default: claude-code-skills / --claude-skills)
# Skills Mode (recommended)
npx cc-sdd@latest --claude-skills            # Claude Code Skills (default, 14 skills)
npx cc-sdd@latest --codex-skills --lang fr   # Codex CLI Skills
npx cc-sdd@latest --cursor-skills --lang zh-TW  # Cursor IDE Skills
npx cc-sdd@latest --copilot-skills --lang pt    # GitHub Copilot Skills
npx cc-sdd@latest --windsurf-skills --lang ja   # Windsurf IDE Skills
npx cc-sdd@latest --opencode-skills --lang en   # OpenCode Skills
npx cc-sdd@latest --gemini-skills --lang es     # Gemini CLI Skills
npx cc-sdd@latest --antigravity                 # Antigravity Skills
# Legacy modes (deprecated — will be removed)
npx cc-sdd@latest --claude        # Use --claude-skills instead
npx cc-sdd@latest --cursor        # Use --cursor-skills instead
npx cc-sdd@latest --copilot       # Use --copilot-skills instead
npx cc-sdd@latest --windsurf      # Use --windsurf-skills instead
npx cc-sdd@latest --opencode      # Use --opencode-skills instead
npx cc-sdd@latest --gemini        # Use --gemini-skills instead
npx cc-sdd@latest --qwen          # Qwen Code

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
| Greek | `el` | 🇬🇷 |

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
1. **Approved specs become executable work** – requirements, design, tasks, and supporting references stay aligned and can drive implementation instead of going stale.
2. **Long-running autonomous implementation** – large task sets run through autonomous implementation with per-task subagent dispatch, independent review, and bounded stop conditions — no external dependencies, works out of the box.
3. **Agent Skills are the durable surface** – the same skill-based workflow can move across Claude Code, Codex, and future skills-capable agents.
4. **Review and final validation flows are built in** – the system is designed to catch mismatches, placeholders, and blocked states before claiming completion.
5. **Customize once for your team** – edit `.kiro/settings/templates/` and every agent/slash command reflects your workflow. Non-skills agents also use `.kiro/settings/rules/`.

## ✨ Key Features

- **📋 Spec-Governed Development** — Structured specs (requirements → research → design → tasks) stay as the governing contract for implementation, not just planning documents
- **🔁 Long-Running Autonomous Implementation** — Run `/kiro-impl` and walk away: each task gets a fresh subagent, an independent adversarial reviewer, and bounded remediation — just native agent capabilities, no external dependencies
- **✅ Review + Final Validation Flows** — Task-local review, validation passes, and final validation flows are built in so the system aims for honest completion and NO-GO outcomes
- **🚀 AI-DLC Methodology** — AI executes, human validates at each phase. [Intensive "bolts"](https://aws.amazon.com/jp/blogs/news/ai-driven-development-life-cycle/) replace weeks-long sprints
- **🧠 Persistent Project Memory** — Steering documents maintain architecture, patterns, rules, and domain knowledge across all sessions
- **🧩 Agent Skills Support** — Each command is a self-contained [Agent Skill](https://agentskills.io) (SKILL.md + tool restrictions + co-located rules), designed to carry forward across skills-capable agents
- **🛠 Customize Once** — Edit `{{KIRO_DIR}}/settings/templates/` and every agent reflects your workflow. 8 agents × 13 languages share the same process
- **🌍 Team-Ready** — Cross-platform, standardized workflows with quality gates. `--codex` blocked, use `--codex-skills`

## 🤖 Supported AI Agents

| Agent | Skills Mode (Recommended) | Legacy Mode |
|-------|--------------------------|-------------|
| **Claude Code** | `--claude-skills` — 14 skills | `--claude` / `--claude-agent` (deprecated) |
| **Codex CLI** | `--codex-skills` — 14 skills | `--codex` (blocked) |
| **Cursor IDE** | `--cursor-skills` — 14 skills | `--cursor` (deprecated) |
| **GitHub Copilot** | `--copilot-skills` — 14 skills | `--copilot` (deprecated) |
| **Windsurf IDE** | `--windsurf-skills` — 14 skills | `--windsurf` (deprecated) |
| **OpenCode** | `--opencode-skills` — 14 skills | `--opencode` / `--opencode-agent` (deprecated) |
| **Gemini CLI** | `--gemini-skills` — 14 skills | `--gemini` (deprecated) |
| **Antigravity** | `--antigravity` — 14 skills | — |
| **Qwen Code** | — | `--qwen` |
 
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
npx cc-sdd@latest --kiro-dir docs
```

## 📁 Project Structure

After installation, your project gets:

```
project/
├── .claude/skills/           # 14 skills (Claude Code Skills mode, default)
├── .claude/commands/kiro/    # 11 slash commands (Claude Code)
├── .agents/skills/           # 14 skills (Codex CLI skills mode)
├── .codex/prompts/           # 11 prompt commands (Codex CLI — blocked, use skills)
├── .github/prompts/          # 11 prompt commands (GitHub Copilot)
├── .windsurf/workflows/      # 11 workflow files (Windsurf IDE)
├── .kiro/settings/templates/ # Shared templates (variables resolved with {{KIRO_DIR}})
├── .kiro/settings/rules/     # Shared rules (non-skills agents only)
├── .kiro/specs/              # Feature specifications
├── .kiro/steering/           # AI guidance documents
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

**Stable Release v3.0.0** - Production-ready. [Report issues](https://github.com/gotalab/cc-sdd/issues) | MIT License

### Platform Support
- Supported OS: macOS, Linux, Windows (auto-detected by default).
- Unified command templates across operating systems; `--os` override is optional for legacy automation.

> **Heads-up:** Passing `--os` still works for backward compatibility, but all platforms now receive the same command set.
