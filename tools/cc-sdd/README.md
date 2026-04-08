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
- ✅ **Scales from small requests to real products** — `/kiro-discovery` is the entry point for new work, from a small feature to a multi-spec initiative. `/kiro-spec-batch` creates all specs in parallel with cross-spec consistency review.
- ✅ **Customize once, adapt as models improve** — 17 skills across all skills-mode agents, with shared rules as single source of truth. Team-aligned templates fit your approval process. As models improve, lighten the harness -- the design makes that easy.

## Core Ideas

- **Boundary-first** -- Specs are most useful when they make responsibility boundaries and contracts explicit enough that teams and agents can work independently.
- **Spec-centered, mechanically grounded** -- Markdown specs carry intent, scope, and boundaries, while tests, builds, linting, and runtime checks keep that intent connected to reality.
- **Change-friendly by design** -- cc-sdd stays intentionally simple and customizable so teams can adapt templates, rules, and workflows to fit their own operating model instead of conforming to one rigid process.
- **Autonomy with explicit stopping points** -- `/kiro-impl` can execute `tasks.md` task by task through TDD and review until the final task is complete, but it is designed to stop when human approval, clarification, or judgment is genuinely required.

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
npx cc-sdd@latest --claude-skills            # Claude Code Skills (default, 17 skills)
npx cc-sdd@latest --codex-skills --lang fr   # Codex CLI Skills (17 skills)
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

### Start Here

Pick the workflow that matches the work:

| You want to... | Skills mode | Legacy mode |
| --- | --- | --- |
| Start new work (feature to initiative) | `kiro-discovery` → `kiro-spec-init` → `kiro-spec-requirements` → `kiro-spec-design` → `kiro-spec-tasks` → `kiro-impl` | `kiro:spec-init` → `kiro:spec-requirements` → `kiro:spec-design` → `kiro:spec-tasks` → `kiro:spec-impl` |
| Extend an existing system | `kiro:steering` → `kiro-discovery` or `kiro:spec-init` → optional `kiro:validate-gap` → `kiro-spec-design` → `kiro-spec-tasks` → `kiro-impl` | `kiro:steering` → `kiro:spec-init` → optional `kiro:validate-gap` → `kiro:spec-design` → `kiro:spec-tasks` → `kiro:spec-impl` |
| Break down a large initiative | `kiro-discovery` → `kiro-spec-batch` | Not available |
| Ship a small change with no spec | `kiro-discovery` → direct implementation | direct implementation |

### For New Projects
```bash
# Skills mode: if you are new to cc-sdd, start here
/kiro-discovery Build a user authentication system with OAuth

# Legacy mode
/kiro:spec-init Build a user authentication system with OAuth
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

### After Discovery

In skills mode, `kiro-discovery` is the easiest entry point for first-time users. Its job is not to finish the workflow for you. Its job is to choose the right workflow, write `brief.md` / `roadmap.md` when needed, suggest the next command, and then stop.

- Existing spec: continue with `kiro-spec-requirements {feature}`
- No spec needed: implement directly
- Single spec: default to `kiro-spec-init <feature>`; use `kiro-spec-quick <feature>` only when you intentionally want the fast path
- Multi-spec: default to `kiro-spec-batch`; use `kiro-spec-init <first-feature>` first if you want to validate one slice before batching the rest
- Mixed decomposition: let discovery separate existing-spec updates, new specs, and direct-implementation candidates before choosing the next step

### Why teams install cc-sdd
1. **Approved specs become executable work** – requirements, design, tasks, and supporting references stay aligned and can drive implementation instead of going stale.
2. **Long-running autonomous implementation** – per-task subagent dispatch, TDD with Feature Flag Protocol, independent adversarial review, auto-debug on failure, and learnings propagation between tasks — no external dependencies, works out of the box.
3. **Agent Skills are the durable surface** – the same skill-based workflow works across Claude Code, Codex, Cursor, Copilot, Windsurf, OpenCode, Gemini CLI, and Antigravity.
4. **Review and final validation flows are built in** – the system is designed to catch mismatches, placeholders, and blocked states before claiming completion.
5. **Customize once for your team** – edit `.kiro/settings/templates/` and every agent/slash command reflects your workflow. Non-skills agents also use `.kiro/settings/rules/`.

## ✨ Key Features

- **📋 Spec-Governed Development** — Structured specs (requirements → research → design → tasks) stay as the governing contract for implementation, not just planning documents
- **🔁 Long-Running Autonomous Implementation** — Run `/kiro-impl` and walk away: each task gets TDD with Feature Flag Protocol, fresh implementer, independent adversarial reviewer, and auto-debug on failure. Learnings propagate between tasks. No external dependencies.
- **✅ Review + Final Validation Flows** — Task-local review, validation passes, and final validation flows are built in so the system aims for honest completion and NO-GO outcomes
- **🚀 AI-DLC Methodology** — AI executes, human validates at each phase. [Intensive "bolts"](https://aws.amazon.com/jp/blogs/news/ai-driven-development-life-cycle/) replace weeks-long sprints
- **🧠 Persistent Project Memory** — Steering documents maintain architecture, patterns, rules, and domain knowledge across all sessions
- **🧩 Agent Skills Support** — Each command is a self-contained [Agent Skill](https://agentskills.io) (SKILL.md + tool restrictions + co-located rules), designed to carry forward across skills-capable agents
- **🛠 Customize Once** — Edit `{{KIRO_DIR}}/settings/templates/` and every agent reflects your workflow. 8 skills-based agents × 13 languages share the same process
- **🌍 Team-Ready** — Cross-platform, standardized workflows with quality gates. `--codex` blocked, use `--codex-skills`

## 🤖 Supported AI Agents

| Agent | Skills Mode (Recommended) | Legacy Mode |
|-------|--------------------------|-------------|
| **Claude Code** | `--claude-skills` — 17 skills | `--claude` / `--claude-agent` (deprecated) |
| **Codex CLI** | `--codex-skills` — 17 skills | `--codex` (blocked) |
| **Cursor IDE** | `--cursor-skills` — 17 skills | `--cursor` (deprecated) |
| **GitHub Copilot** | `--copilot-skills` — 17 skills | `--copilot` (deprecated) |
| **Windsurf IDE** | `--windsurf-skills` — 17 skills | `--windsurf` (deprecated) |
| **OpenCode** | `--opencode-skills` — 17 skills | `--opencode` / `--opencode-agent` (deprecated) |
| **Gemini CLI** | `--gemini-skills` — 17 skills | `--gemini` (deprecated) |
| **Antigravity** | `--antigravity` — 17 skills | — |
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

📖 **[Skill Reference](https://github.com/gotalab/cc-sdd/blob/main/docs/guides/skill-reference.md)** - Skills-mode workflow, supporting skills, and when to use each one

📖 **[Complete Command Reference](https://github.com/gotalab/cc-sdd/blob/main/docs/guides/command-reference.md)** - Detailed usage, parameters, examples, and troubleshooting for legacy `/kiro:*` commands

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
├── .claude/skills/           # 17 skills (Claude Code Skills mode, default)
├── .claude/commands/kiro/    # 11 slash commands (Claude Code)
├── .agents/skills/           # 17 skills (Codex CLI skills mode)
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

- Skill Reference: [English](../../docs/guides/skill-reference.md) | [日本語](../../docs/guides/ja/skill-reference.md)
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
