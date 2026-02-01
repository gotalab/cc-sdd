# Release Notes

New features and improvements for cc-sdd. See [CHANGELOG.md](../../CHANGELOG.md) for technical changes.

---

## 🔬 In Development (Unreleased)

No unreleased features at this time. The latest stable release is v2.1.1.

---

## 🔧 Ver 2.1.1 (2026-02-02) – Bug Fixes & Security

### Fixed
- Fixed OpenCode agent slash command frontmatter to use full agent path for proper command execution.

### Security
- Updated vitest to v4 to resolve security vulnerabilities.

### New Contributors
* @hiiamkazuto made their first contribution in #134

- Resources: [CHANGELOG.md](../../CHANGELOG.md#211---2026-02-02), PRs: [#134](https://github.com/gotalab/cc-sdd/pull/134), [#135](https://github.com/gotalab/cc-sdd/pull/135)

---

## 🚀 Ver 2.1.0 (2026-02-01) – OpenCode Support

### 🎯 Highlights
- **OpenCode Support**: Added the 8th supported agent with full Spec-Driven Development workflow integration.
- **Model Updates**: Updated recommended models to Opus 4.5, GPT-5.2, and Gemini 3 Flash for improved performance.

### ✨ Added
- **OpenCode** ([#117](https://github.com/gotalab/cc-sdd/pull/117), [#127](https://github.com/gotalab/cc-sdd/pull/127))
  - `.opencode/commands/` with all 11 kiro commands
  - OpenCode Agents (subagent version) in `.opencode/agents/`
  - OPENCODE.md project memory template
  - Installation: `npx cc-sdd@latest --opencode` or `--opencode-agent`

### 🔧 Changed
- Updated recommended models ([#128](https://github.com/gotalab/cc-sdd/pull/128), [#129](https://github.com/gotalab/cc-sdd/pull/129))
  - Claude: Opus 4.5
  - OpenAI: GPT-5.2
  - Google: Gemini 3 Flash
- Removed think keywords from templates for cleaner prompts

### 📈 Key Metrics
- **Supported Agents**: 8 (Claude Code, Cursor, Gemini CLI, Codex CLI, GitHub Copilot, Qwen Code, Windsurf, **OpenCode**)
- **Commands**: 11 per agent
- **Languages**: 13

### 🙏 New Contributors
* @inovue made their first contribution in #117

- Resources: [CHANGELOG.md](../../CHANGELOG.md#210---2026-02-01), PRs: [#117](https://github.com/gotalab/cc-sdd/pull/117), [#127](https://github.com/gotalab/cc-sdd/pull/127), [#128](https://github.com/gotalab/cc-sdd/pull/128), [#129](https://github.com/gotalab/cc-sdd/pull/129)

---

## 🌍 Ver 2.0.5 (2026-01-08) – Greek Language Support

### Added
- Added Greek (el) language support, bringing the total to 13 supported languages.

### New Contributors
* @tpapamichail made their first contribution in #121

- Resources: [CHANGELOG.md](../../CHANGELOG.md#205---2026-01-08), PR: [#121](https://github.com/gotalab/cc-sdd/pull/121)

---

## 📝 Ver 2.0.4 (2026-01-07) – Bug fixes & Documentation

### Fixed
- Updated GitHub Copilot prompt files to replace deprecated `mode` attribute with `agent` for compatibility with latest Copilot specifications.
- Fixed registry.ts with review improvements.

### Documentation
- Added AI-Assisted SDD book reference to cc-sdd documentation.

### New Contributors
* @irisTa56 made their first contribution in #118
* @leosamp made their first contribution in #109
* @Kakenyan made their first contribution in #107

- Resources: [CHANGELOG.md](../../CHANGELOG.md#204---2026-01-07), PRs: [#118](https://github.com/gotalab/cc-sdd/pull/118), [#109](https://github.com/gotalab/cc-sdd/pull/109), [#107](https://github.com/gotalab/cc-sdd/pull/107)

---

## 📝 Ver 2.0.3 (2025-11-15) – GPT-5.1 Codex tuning

- Refined recommended OpenAI models for Codex CLI, Cursor, GitHub Copilot, and Windsurf to explicitly include `gpt-5.1-codex medium/high` as the primary code-focused option, with `gpt-5.1 medium/high` as a general-purpose fallback.
- Updated DEV_GUIDELINES-related tests so they match the stricter language-handling rules introduced in v2.0.2, keeping runtime behavior unchanged while ensuring `npm test` passes cleanly for v2.0.3.

- Resources: [CHANGELOG.md](../../CHANGELOG.md#203---2025-11-15), PR: [#104](https://github.com/gotalab/cc-sdd/pull/104)

---

## 📝 Ver 2.0.2 (2025-11-15) – GPT-5.1 & spec stability

- Optimized prompts and agent defaults for GPT-5.1 by recommending `GPT-5.1 high or medium` for Codex CLI, Cursor, GitHub Copilot, and Windsurf.
- Tightened language handling so all generated Markdown (requirements, design, tasks, research, validation) uses the spec’s target language and falls back to English (`en`) when `spec.json.language` is not set.
- Made EARS patterns and traceability more consistent by keeping EARS trigger phrases in English, localizing only the variable slots, and enforcing numeric requirement IDs (e.g. `Requirement 1`, `1.1`, `2.3`) so requirements → design → tasks mappings are stable and fail fast when IDs are missing or invalid.

- Resources: [CHANGELOG.md](../../CHANGELOG.md#202---2025-11-15), PR: [#102](https://github.com/gotalab/cc-sdd/pull/102)

---

## 📝 Ver 2.0.1 (2025-11-10) – Documentation update

### Summary
Documentation-only release improving README clarity and visual consistency.

### Resources
- PRs: [#93](https://github.com/gotalab/cc-sdd/pull/93), [#94](https://github.com/gotalab/cc-sdd/pull/94)
- [CHANGELOG.md](../../CHANGELOG.md#201---2025-11-10)

---

## 🎉 Ver 2.0.0 (2025-11-09) – Stable Release

### Highlights at a Glance
- **`npx cc-sdd@latest` = full stack SDD**: all alpha capabilities (research.md, validation commands, Subagents, Windsurf) are now GA.
- **Spec-to-impl fidelity**: Research/Design/Tasks templates now enforce requirement IDs, component density rules, and Supporting References for long-form details.
- **Brownfield guardrails**: `/kiro:validate-*` commands, parallel-task analysis, and steering-wide project memory reduce drift before any code change.
- **Global parity**: 7 AI agents × 13 languages share the same templates, prompts, and installation flow.

### Upgrade Essentials
1. Follow the [Migration Guide](../guides/migration-guide.md) for template layout changes (`.kiro/settings/templates/*`) and new steering behavior (directory-wide load).
2. Update automation/scripts to call `npx cc-sdd@latest` (the `@next` tag is reserved for future previews).
3. Regenerate steering + spec templates once to pick up Research.md, the new design rules, and tasks parallel markers.

### Key Capabilities in this release
- **Parallel Task Analysis** – automatic `(P)` markers + `--sequential` escape hatch.
- **Research.md Template** – isolates discovery logs and architectural trade-offs from the design SSOT.
- **Design Template Overhaul** – summary tables, requirement coverage, Supporting References, and heavy component blocks only where they matter.
- **Agent Coverage** – Claude Code + Subagents, Cursor, Gemini CLI, Codex CLI, Copilot, Qwen, Windsurf with matching 11-command workflows.
- **Interactive Installer** – guided setup with project-memory handling, npm badges, and improved documentation navigation.

### Resources
- Full technical diff: see [CHANGELOG.md](../../CHANGELOG.md#200---2025-11-09).
- Migration specifics: [docs/guides/migration-guide.md](../guides/migration-guide.md).
- PLAN references: `docs/cc-sdd/v2.0.0/PLAN.md` for release tasks, `docs/cc-sdd/v2.0.0/PLAN2.md` for design-template scope.

Once your project templates are regenerated on v2.0.0, all spec/todo automation should operate without additional flags.

---

## Previous Alpha Releases

## 🚀 Ver 2.0.0-alpha.5 (2025-11-05)

### 🎯 Highlights
- **EARS Format Improvement**: Unified EARS format to lowercase syntax for better readability in requirements definition.
- **Enhanced Documentation**: Improved user experience with clarified installation instructions and npm badge addition.

### 🔧 Improvements
- Updated EARS format to lowercase syntax ([#88](https://github.com/gotalab/cc-sdd/pull/88))
  - Changed from "WHILE/WHEN/WHERE/IF" to "while/when/where/if"
  - More natural and readable requirements description
- Clarified installation documentation ([#87](https://github.com/gotalab/cc-sdd/pull/87))
- Added npm `next` version badge to README files ([#86](https://github.com/gotalab/cc-sdd/pull/86))

---

## 📚 Ver 2.0.0-alpha.4 (2025-10-30)

### 🎯 Highlights
- **Comprehensive Customization Guide**: Added customization guide with 7 practical examples and complete command reference, making it easier to tailor templates to your project needs.

### 📖 New Documentation
- **Customization Guide** ([#83](https://github.com/gotalab/cc-sdd/pull/83))
  - Template customization patterns
  - Agent-specific workflow examples
  - Project-specific rule examples
  - 7 practical customization examples
- **Command Reference** ([#83](https://github.com/gotalab/cc-sdd/pull/83))
  - Detailed usage for all 11 `/kiro:*` commands
  - Parameter descriptions and practical examples

### 🔧 Improvements
- Clarified template customization instructions ([#85](https://github.com/gotalab/cc-sdd/pull/85))
- Customization guide review improvements ([#84](https://github.com/gotalab/cc-sdd/pull/84))

---

## 🤖 Ver 2.0.0-alpha.3.1 (2025-10-24)

### 🎯 Highlights
- **Automated GitHub Issue Management**: Automatically closes inactive issues after 10 days, streamlining project management.

### ⚙️ Automation
- Automated GitHub issue lifecycle management ([#80](https://github.com/gotalab/cc-sdd/pull/80))
  - Auto-close stale issues after 10 days of inactivity
  - Configurable stale detection workflow
  - English-only workflow messaging ([#81](https://github.com/gotalab/cc-sdd/pull/81))

### 🔧 Improvements
- Updated stale detection period to 10 days
- Improved GitHub Actions workflow for issue management

---

## 🚀 Ver 2.0.0-alpha.3 (2025-10-22)

### 🎯 Highlights
- **Windsurf IDE support**: Added a dedicated manifest, workflow templates under `.windsurf/workflows/`, and an AGENTS.md quickstart so Windsurf users can run the full kiro Spec-Driven Development workflow with `npx cc-sdd@next --windsurf`.
- **CLI experience refresh**: Updated completion guides and recommended models so the setup summary now points Windsurf users to the correct follow-up commands and manual QA flow.

### 🧪 Quality & Tooling
- Added `realManifestWindsurf` integration tests that cover dry-run planning, cross-platform (macOS/Linux) execution, and completion messaging.
- Extended CLI argument parsing to recognize the `--windsurf` alias and ensured the agent registry emits the correct layout metadata.

### 📚 Documentation
- Refreshed the root README, CLI docs (`tools/cc-sdd/README*`), and legacy guides (`docs/README/README_{en,ja,zh-TW}.md`) with Windsurf instructions, updated quick-start matrices, and the manual QA checklist using `npx cc-sdd@next --windsurf`.

### 📈 Key Metrics
- **Supported platforms**: 7 (Claude Code, Cursor IDE, Gemini CLI, Codex CLI, GitHub Copilot, Qwen Code, Windsurf IDE)
- **Command/workflow count**: 11 per agent (identical spec/validate/steering coverage)
- **Automated coverage**: 1 new real-manifest test scenario dedicated to Windsurf

---

## 🚀 Ver 2.0.0-alpha.2 (2025-10-13)

### 🎯 Highlights
- **Guided CLI installer**: Interactive setup with file preview
- **Spec-driven command redesign**: Re-authored all 11 commands
- **Steering overhaul**: Project Memory with directory-wide loading
- **Flexible deliverables**: Shared settings bundle
- **Codex CLI support**: 11 prompts in `.codex/prompts/`
- **GitHub Copilot support**: 11 prompts in `.github/prompts/`

### 📈 Key Metrics
- **Platforms**: 6
- **Commands**: 11 (6 spec + 3 validate + 2 steering)

---

## Ver 1.1.0 (September 8, 2025 Official Release) 🎯

### ✨ Brownfield Development Features Added
Enhanced spec-driven development for existing projects

**New Quality Validation Commands**
- 🔍 **`/kiro:validate-gap`** - Gap analysis between existing functionality and requirements
  - Execute before spec-design to clarify differences between current implementation and new requirements
  - Identify existing system understanding and integration points for new features
- ✅ **`/kiro:validate-design`** - Design compatibility verification with existing architecture
  - Execute after spec-design to confirm design integration feasibility
  - Pre-detect conflicts and incompatibilities with existing systems

### 🚀 Full Cursor IDE Support
Official support as the third major platform
- **11 commands** - Full functionality equivalent to Claude Code/Gemini CLI
- **AGENTS.md configuration file** - Optimized settings specific to Cursor IDE
- **Unified workflow** - Same development experience across all platforms

### 📊 Command System Expansion
Enhanced spec-driven development completeness
- **Expanded from 8 to 11 commands** - Enriched with validation and implementation review commands
- **Optional workflows** - Quality gates can be added as needed
- **Flexible development paths** - Optimal flows for new/existing projects

### 📚 Major Documentation Improvements
Refreshed for clarity and conciseness

**Structural Improvements**
- **Quick Start separation** - Distinct flows for new vs existing projects
- **Clarified steering positioning** - Emphasized importance as project memory
- **Simplified verbose explanations** - 30-50% reduction in each section for improved readability

**Content Enhancements**
- **AI-DLC "bolts" concept** - Clarified terminology with AWS article links
- **Kiro IDE integration explanation** - Emphasized portability and implementation guardrails
- **Added Speaker Deck presentation** - "Claude Code Doesn't Dream of Spec-Driven Development"

### 🔧 Technical Improvements
Enhanced development experience and maintainability
- **GitHub URL updates** - Migration support to gotalab/cc-sdd
- **Typo corrections** - "Clade Code" → "Claude Code"
- **CHANGELOG organization** - Moved to docs directory

### 📈 Key Metrics
- **Supported platforms**: 5 (Claude Code, Cursor IDE, Gemini CLI, Codex CLI, GitHub Copilot)
- **Command count**: 11 (6 spec + 3 validate + 2 steering)
- **Documentation languages**: 3 (English, Japanese, Traditional Chinese)
- **npm weekly downloads**: Stable growth

---

## Ver 1.0.0 (August 31, 2025 Major Update) 🚀

### 🚀 Multi-Platform Support Complete
Unified spec-driven development across four platforms
- 🤖 **Claude Code** - Original platform
- 🔮 **Cursor** - IDE integration support
- ⚡ **Gemini CLI** - TOML structured configuration
- 🧠 **Codex CLI** - GPT-5 optimized prompt design

### 📦 cc-sdd Package Distribution Started
[cc-sdd](https://www.npmjs.com/package/cc-sdd) - AI-DLC + Spec Driven Development
- Claude Code & Gemini CLI support
- Installable via `npx cc-sdd@latest`

### 🔄 Development Workflow Complete Overhaul
Fundamental review of entire spec-driven development workflow
- **Near complete rebuild** level overhaul implemented
- Unified for more consistent output across platforms

---

## Ver 0.3.0 (August 12, 2025 Update)

### Major Kiro Spec-Driven Development Command Improvements

**Workflow Efficiency**
- Added `-y` flag: `/kiro:spec-design feature-name -y` skips requirements approval and generates design
- `/kiro:spec-tasks feature-name -y` skips requirements+design approval and generates tasks  
- Added argument-hint: Commands now auto-display `<feature-name> [-y]` during input
- Traditional step-by-step approval still available (spec.json editing or interactive approval)

**Command Optimization**
- spec-init.md: 162→104 lines (36% reduction, removed project_description and simplified templates)
- spec-requirements.md: 177→124 lines (30% reduction, simplified verbose explanations)
- spec-tasks.md: 295→198 lines (33% reduction, eliminated "Phase X:", functional naming, granularity optimization)

**Task Structure Optimization**
- Section headers for functional area organization
- Task granularity limits (3-5 sub-items, 1-2 hour completion)
- Standardized _Requirements: X.X, Y.Y_ format

**Custom Steering Support**
- All spec commands now utilize project-specific context
- Flexible Always/Conditional/Manual mode configuration loading

---

## Ver 0.2.1 (July 27, 2025 Update)

### CLAUDE.md Performance Optimization

**System Prompt Optimization**
- Reduced CLAUDE.md files from 150 lines to 66 lines
- Removed duplicate sections and redundant explanations
- Implemented unified optimization across Japanese, English, and Traditional Chinese versions

**Functionality Preservation**
- Maintained all essential execution context
- Preserved steering configuration and workflow information
- No impact on interactive approval functionality

**Minor Updates**
- Added "think" keyword to spec-requirements.md

---

## Ver 0.2.0 (July 26, 2025 Update)

### Interactive Approval System

**Approval Flow Improvements**
- `/spec-design [feature-name]` now displays "Have you reviewed requirements.md? [y/N]" confirmation prompt
- `/spec-tasks [feature-name]` now displays review confirmation for both requirements and design
- 'y' approval automatically updates spec.json and proceeds to next phase
- 'N' selection stops execution and prompts for review

**Simplified Operations**
- Previous: Manual editing of spec.json file required to set `"approved": true`
- Current: Simple response to confirmation prompt completes approval
- Manual approval method remains available

### Specification Generation Quality Improvements

**Enhanced requirements.md Generation**
- EARS format output now generates in more unified format
- Hierarchical requirement structure outputs in more organized format
- Improved comprehensiveness and specificity of acceptance criteria

**Enhanced design.md**
- Technical research process now integrated into design phase
- Requirements mapping and traceability reflected in design documents
- Improved document structure for architecture diagrams, data flow diagrams, ERDs
- More detailed descriptions of security, performance, and testing strategies

**Improved tasks.md**
- Implementation tasks optimized for code generation LLMs
- Test-driven development approach integrated into each task
- Clearer management of inter-task dependencies
- Improved to independent prompt format aligned with Kiro design principles

### Fixed Issues

**Improved Directory Handling**
- Now works properly even when `.kiro/steering/` directory doesn't exist
- More user-friendly error messages

**Improved Internal File Management**
- Excluded development prompt files from version control

### System Design Simplification

**Removed progress Field**
- Completely removed redundant progress field that caused sync errors
- Achieved clearer state management with only phase + approvals
- Simplified spec.json structure and improved maintainability

**Revised Requirements Generation Approach**
- Reverted from overly comprehensive requirements generation to original Kiro design
- Removed forceful expressions like "CRITICAL" and "MUST"
- Changed to gradual requirements generation focused on core functionality
- Restored natural development flow premised on iterative improvement

---

## Ver 0.1.5 (July 25, 2025 Update)

### Major Steering System Enhancement

**Enhanced Security Features**
- Added security guidelines and content quality guidelines
- Enabled safer and higher quality project management

**Improved inclusion modes Functionality**
- Three modes (Always included, Conditional, Manual) are now more user-friendly
- Added detailed usage recommendations and guidance

**Unified Steering Management Functions**
- `/kiro:steering` command now properly handles existing files
- More intuitive steering document management

**Improved System Stability**
- Fixed Claude Code pipe bugs for more reliable execution
- Now works properly in non-Git environments

---

## Ver 0.1.0 (July 18, 2025 Update)

### Basic Features
- Implemented Kiro IDE-style specification-driven development system
- 3-phase approval workflow: Requirements → Design → Tasks → Implementation
- EARS format requirements definition support
- Hierarchical requirements structure organization
- Automatic progress tracking and hook functionality
- Basic Slash Commands set

### Quality Management Features
- Quality assurance through manual approval gates
- Specification compliance check functionality
- Context preservation functionality

---

## Ver 0.0.1 (July 17, 2025 Update)

### New Features
- Created initial project structure

---

## Development History

**July 17-18, 2025: Foundation Building Period**
Project initialization and implementation of core framework for Kiro-style specification-driven development

**July 18-24, 2025: Multilingual & Feature Expansion Period**
Added English and Traditional Chinese support, GitHub Actions integration, enhanced documentation

**July 25, 2025: Steering System Enhancement Period**
Security enhancements, inclusion modes improvements, system stability improvements

**July 26, 2025: Specification Generation Quality Innovation & System Simplification**
Significantly improved generation quality of requirements, design, and tasks documents, removed excessive progress tracking and returned to original Kiro design

---

## Usage

1. Copy **`.claude/commands/` directory** and **`CLAUDE.md` file** to your project
2. Run `/kiro:steering` in Claude Code to configure project information
3. Create new specifications with `/kiro:spec-init [feature-name]`
4. Progress through development step by step: requirements → design → tasks

For detailed usage instructions, see [README_en.md](README_en.md).

## Related Links

- **[Zenn Article](https://zenn.dev/gotalab/articles/3db0621ce3d6d2)** - Detailed explanation of Kiro's specification-driven development process
- **[Japanese Documentation](README.md)**
- **[Traditional Chinese Documentation](README_zh-TW.md)**
- **Claude Code Command Refresh**: Retired `.tpl` files and standardized on 11 commands (including `validate-impl`), delivering the same cross-platform template set with a simplified layout.
