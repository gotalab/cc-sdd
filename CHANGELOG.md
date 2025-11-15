# Changelog

All notable changes to this project will be documented in this file.

**Release Notes**:
- [Japanese](docs/RELEASE_NOTES/RELEASE_NOTES_ja.md)
- [English](docs/RELEASE_NOTES/RELEASE_NOTES_en.md)

## [Unreleased]

## [2.0.2] - 2025-11-15

### Changed
- Strengthen `DEV_GUIDELINES` so that all Markdown content written to project files (requirements, design, tasks, research, validation reports) must use the target language configured for each spec (`spec.json.language` / `{{LANG_CODE}}`).
- Normalize language fallback behavior across all agents so that when `spec.json.language` is undefined, English (`en`) is used as the default instead of Japanese.
- Clarify EARS format rules in `templates/shared/settings/rules/ears-format.md`:
  - Define EARS as a language-agnostic logical structure (condition + subject + response).
  - Require acceptance criteria to be written in the target language while keeping EARS trigger keywords and fixed phrases (`When`, `If`, `While`, `Where`, `The system shall`, `The [system] shall`) in English and treating them as atomic fragments (do not interleave target-language words inside these phrases).
 - Update recommended OpenAI model names for Codex CLI, Cursor, GitHub Copilot, and Windsurf agents to `GPT-5.1 high or medium`.
 - PRs: [#102](https://github.com/gotalab/cc-sdd/pull/102)

## [2.0.1] - 2025-11-10

### Changed
- Improve README clarity and visual consistency ([#93](https://github.com/gotalab/cc-sdd/pull/93), [#94](https://github.com/gotalab/cc-sdd/pull/94))

## [2.0.0] - 2025-11-09

### Summary

- Consolidates every feature shipped in 2.0.0-alpha.1〜alpha.6 and promotes them to `npx cc-sdd@latest`.
- Adds validation commands, Research.md, steering/memory upgrades, and 7-agent / 12-language parity.
- For migration steps, see `docs/guides/migration-guide.md` (referenced from release notes as well).

### Added

#### Core Features
- **Parallel task analysis** by default in spec-tasks command ([#89](https://github.com/gotalab/cc-sdd/pull/89))
  - Automatic `(P)` marker for parallel-executable tasks
  - New `--sequential` flag to opt-out of parallel analysis
  - New rule file: `tasks-parallel-analysis.md` for identifying parallel tasks
- **Research.md template** for spec-driven workflow
  - Separates discovery findings and architectural investigations from `design.md`
  - Captures research logs, architecture pattern evaluations, and design decisions
  - Provides structured format for documenting trade-offs and rationale
- **Guidelines for excluding agent tooling directories** from steering docs
  - Prevents `.claude/`, `.cursor/`, `.codex/` etc. from being analyzed

#### Platform Support (from alpha releases)
- **Claude Code Subagents mode** for context optimization ([#74](https://github.com/gotalab/cc-sdd/pull/74))
  - Delegate SDD commands to dedicated subagents to preserve main conversation context
  - Improve session lifespan by isolating command-specific context
  - Specialized system prompts for each command type
  - 12 commands + 9 Subagent definitions
- **Windsurf IDE support** with complete workflow integration
  - `.windsurf/workflows/` directory with 11 workflow files
  - AGENTS.md configuration for optimization
  - `--windsurf` CLI flag
- **Codex CLI official support** with 11 prompts in `.codex/prompts/`
- **GitHub Copilot official support** with 11 prompts in `.github/prompts/`

#### Validation Commands (Brownfield Development)
- **`/kiro:validate-gap`** - Analyze implementation gap between requirements and existing codebase
- **`/kiro:validate-design`** - Validate design compatibility with existing architecture
- **`/kiro:validate-impl`** - Validate implementation against requirements, design, and tasks

#### Developer Experience
- **Interactive CLI installer** with guided setup ([#70](https://github.com/gotalab/cc-sdd/pull/70))
  - Organized file display by Commands / Project Memory / Settings categories
  - Interactive project memory handling (overwrite/append/keep)
- **Comprehensive documentation**
  - Complete command reference with 11 `/kiro:*` commands ([#83](https://github.com/gotalab/cc-sdd/pull/83))
  - Customization guide with 7 practical examples ([#83](https://github.com/gotalab/cc-sdd/pull/83))
  - Migration guide for v1.x users
- **npm badges** for version tracking ([#86](https://github.com/gotalab/cc-sdd/pull/86))

### Changed

#### Architecture & Structure
- **Unified template structure** - removed `os-mac/os-windows` directories in favor of single `commands/` structure
- **All templates now use actual extensions** (`.md`, `.prompt.md`, `.toml`)
- **Steering now functions as project-wide rules/patterns/guidelines** (Project Memory)
  - Enhanced steering system loading all documents under `steering/` directory
- **Shared settings bundle** in `{{KIRO_DIR}}/settings` for cross-platform customization

#### Commands & Workflow
- **Redesigned all 11 Spec-Driven commands** (`spec-*`, `validate-*`, `steering*`) with improved context
- **Enhanced task generation guidelines** with parallel execution criteria
- **Improved design template** with discovery process guidelines
- **Updated spec-design workflow** to leverage new research.md template
- **Streamlined tasks.md template structure**

#### Documentation & Formats
- **Updated EARS format** to use lowercase syntax ([#88](https://github.com/gotalab/cc-sdd/pull/88))
  - Changed from "WHILE/WHEN/WHERE/IF" to "while/when/where/if"
  - Improved readability and consistency
- **Clarified template customization instructions** ([#85](https://github.com/gotalab/cc-sdd/pull/85))
- **Updated installation documentation** for better clarity ([#87](https://github.com/gotalab/cc-sdd/pull/87))
- **Reorganized documentation structure**
  - Renamed `docs/CHANGELOG/` to `docs/RELEASE_NOTES/`
  - Separated technical changelog from marketing-focused release notes
  - Added cross-references between CHANGELOG and Release Notes

#### Project Management
- **Automated GitHub issue lifecycle management** ([#80](https://github.com/gotalab/cc-sdd/pull/80))
  - Auto-close stale issues after 10 days of inactivity
  - Configurable stale detection workflow
  - English-only workflow messaging ([#81](https://github.com/gotalab/cc-sdd/pull/81))
- **Centralized agent metadata into registry** ([#72](https://github.com/gotalab/cc-sdd/pull/72))

### Fixed
- Template structure standardization across all agents
- Manifest definitions for new directory layouts
- Template parameter replacement across platforms
- OS-specific command handling for Windows environments

### Removed
- OS-specific template directories (`os-mac`, `os-windows`)
- Deprecated Claude documentation files
- Duplicate CLAUDE.md files
- Unused documentation artifacts

### Breaking Changes

⚠️ **Important**: Please review the [Migration Guide](docs/guides/migration-guide.md) when upgrading from v1.x.

1. **Template Structure**: OS-specific directories removed. Use unified templates in `.kiro/settings/templates/`
2. **Steering**: Now loads entire `steering/` directory instead of single file
3. **File Extensions**: Templates use actual extensions (`.md`, `.prompt.md`, `.toml`)
4. **Command Count**: Expanded from 8 to 11 commands (3 validation commands added)

### Migration from v1.x

See the comprehensive [Migration Guide](docs/guides/migration-guide.md) for detailed upgrade instructions, including:
- Step-by-step migration procedures
- Breaking changes explained
- Template and steering migration
- Troubleshooting common issues

> For release storytelling, refer to `docs/RELEASE_NOTES/*`. This changelog keeps the technical diff only.

---

## Previous Alpha Releases

## [2.0.0-alpha.6] - 2025-11-09

### Added
- Parallel task analysis features (included in v2.0.0)
- Research.md template (included in v2.0.0)

## [2.0.0-alpha.5] - 2025-11-05

### Added
- npm `next` version badge in README files ([#86](https://github.com/gotalab/cc-sdd/pull/86))

### Changed
- Updated EARS format to use lowercase syntax ([#88](https://github.com/gotalab/cc-sdd/pull/88))
  - Changed from "WHILE/WHEN/WHERE/IF" to "while/when/where/if"
  - Improved readability and consistency
- Updated installation documentation for better clarity ([#87](https://github.com/gotalab/cc-sdd/pull/87))

**Related PRs:**
- [#88](https://github.com/gotalab/cc-sdd/pull/88) - Update EARS format to lowercase syntax
- [#87](https://github.com/gotalab/cc-sdd/pull/87) - Clarify installation
- [#86](https://github.com/gotalab/cc-sdd/pull/86) - Add npm next badge to README files

## [2.0.0-alpha.4] - 2025-10-30

### Added
- Comprehensive customization guide with 7 practical examples ([#83](https://github.com/gotalab/cc-sdd/pull/83))
  - Template customization patterns
  - Agent-specific workflow examples
  - Project-specific rule examples
- Complete command reference documentation ([#83](https://github.com/gotalab/cc-sdd/pull/83))
  - Detailed usage for all 11 `/kiro:*` commands
  - Parameter descriptions and examples

### Changed
- Clarified template customization instructions ([#85](https://github.com/gotalab/cc-sdd/pull/85))
- Customization guide review improvements ([#84](https://github.com/gotalab/cc-sdd/pull/84))

**Related PRs:**
- [#83](https://github.com/gotalab/cc-sdd/pull/83) - Add customization guide and command reference
- [#84](https://github.com/gotalab/cc-sdd/pull/84) - Customization guide review suggestions
- [#85](https://github.com/gotalab/cc-sdd/pull/85) - Clarify template customization instructions

## [2.0.0-alpha.3.1] - 2025-10-24

### Added
- Automated GitHub issue lifecycle management ([#80](https://github.com/gotalab/cc-sdd/pull/80))
  - Auto-close stale issues after 10 days of inactivity
  - Configurable stale detection workflow
  - English-only workflow messaging ([#81](https://github.com/gotalab/cc-sdd/pull/81))

### Changed
- Updated stale detection period to 10 days
- Improved GitHub Actions workflow for issue management

**Related PRs:**
- [#80](https://github.com/gotalab/cc-sdd/pull/80) - Automate GitHub issue lifecycle management
- [#81](https://github.com/gotalab/cc-sdd/pull/81) - Make stale workflow messaging English-only

## [2.0.0-alpha.3] - 2025-10-22

### Added
- Windsurf IDE agent definition, manifest, and workflow templates so `npx cc-sdd@next --windsurf` installs `.windsurf/workflows/` and AGENTS.md alongside shared settings.
- `realManifestWindsurf` vitest coverage that exercises dry-run and apply flows across macOS/Linux runtimes.
- `--windsurf` CLI alias support and accompanying argument parser tests.

### Changed
- Updated completion guides and recommended model messaging to include Windsurf-specific guidance.
- Refreshed root README, `tools/cc-sdd/README*`, and `docs/README/README_{en,ja,zh-TW}.md` with Windsurf setup instructions and manual QA steps.

## [2.0.0-alpha.2] - 2025-10-13

### Added
- Claude Code Subagents mode for context optimization ([#74](https://github.com/gotalab/cc-sdd/pull/74))
  - Delegate SDD commands to dedicated subagents to preserve main conversation context
  - Improve session lifespan by isolating command-specific context
  - Specialized system prompts for each command type
  - Related issue: [#68](https://github.com/gotalab/cc-sdd/issues/68)
- CHANGELOG.md at root following Keep a Changelog format
- Release Notes documentation structure in `docs/RELEASE_NOTES/`
  - Japanese version (RELEASE_NOTES_ja.md)
  - English version (RELEASE_NOTES_en.md)

### Changed
- Reorganized documentation structure
  - Renamed `docs/CHANGELOG/` to `docs/RELEASE_NOTES/`
  - Separated technical changelog from marketing-focused release notes
  - Added cross-references between CHANGELOG and Release Notes
- Improved Claude Code agent templates with updated recommendations
- Centralized agent metadata into registry ([#72](https://github.com/gotalab/cc-sdd/pull/72))

### Removed
- Deprecated Claude documentation files
- Duplicate CLAUDE.md files
- Unused documentation artifacts

**Related PRs:**
- [#74](https://github.com/gotalab/cc-sdd/pull/74) - Add Claude Code Subagents mode
- [#73](https://github.com/gotalab/cc-sdd/pull/73) - Add CLAUDE.md documentation
- [#72](https://github.com/gotalab/cc-sdd/pull/72) - Refactor agent metadata into central registry

## [2.0.0-alpha.1] - 2025-10-08

### Added
- Interactive CLI installer with guided setup (`npx cc-sdd@latest`)
  - Organized file display by Commands / Project Memory / Settings categories
  - Interactive project memory handling (overwrite/append/keep)
- Codex CLI official support with 11 prompts in `.codex/prompts/`
- GitHub Copilot official support with 11 prompts in `.github/prompts/`
- Shared settings bundle in `{{KIRO_DIR}}/settings` for cross-platform customization
- Enhanced steering system loading all documents under `steering/` directory

### Changed
- Redesigned all 11 Spec-Driven commands (`spec-*`, `validate-*`, `steering*`) with improved context
- Unified template structure - removed `os-mac/os-windows` directories in favor of single `commands/` structure
- All templates now use actual extensions (`.md`, `.prompt.md`, `.toml`)
- Steering now functions as project-wide rules/patterns/guidelines (Project Memory)
- Updated manifests and CLI with `--codex`, `--github-copilot` flags

### Fixed
- Template structure standardization across all agents
- Manifest definitions for new directory layouts

### Removed
- OS-specific template directories (`os-mac`, `os-windows`)

**Metrics:**
- Supported Platforms: 6 (Claude Code, Cursor IDE, Gemini CLI, Codex CLI, GitHub Copilot, Qwen Code)
- Commands: 11 (6 spec + 3 validate + 2 steering)

**Related PRs:**
- [#71](https://github.com/gotalab/cc-sdd/pull/71) - Add alpha version info and improve language table
- [#70](https://github.com/gotalab/cc-sdd/pull/70) - Release cc-sdd v2.0.0-alpha

## [1.1.5] - 2025-09-24

### Added
- Qwen Code AI assistant support ([#64](https://github.com/gotalab/cc-sdd/pull/64))
  - Reuse gemini-cli templates to minimize code duplication
  - Command directory: `.qwen/commands/kiro`
  - QWEN.md template for project memory

## [1.1.4] - 2025-09-17

### Fixed
- Bash command errors in steering templates ([#62](https://github.com/gotalab/cc-sdd/pull/62))
  - Reverted to original bash one-liner style
  - Maintained Windows compatibility

## [1.1.3] - 2025-09-15

### Changed
- Improved steering command templates ([#60](https://github.com/gotalab/cc-sdd/pull/60))
  - Simplified custom files check logic using `ls + wc`
  - Added `AGENTS.md` to project analysis section

### Fixed
- Kiro IDE integration descriptions in READMEs ([#61](https://github.com/gotalab/cc-sdd/pull/61))
  - Clarified spec portability to Kiro IDE
  - Removed confusing command references

## [1.1.2] - 2025-09-14

### Added
- Multi-language support for project memory documents ([#59](https://github.com/gotalab/cc-sdd/pull/59))
  - Centralized development guideline strings by language
  - Single templates with `DEV_GUIDELINES` placeholder

### Changed
- Consolidated agent documentation templates
- Updated manifests and tests for new template structure

## [1.1.1] - 2025-09-07

### Changed
- Updated repository URL throughout the project
- Improved test coverage and fixed edge cases ([#57](https://github.com/gotalab/cc-sdd/pull/57))

### Fixed
- CLI messages and linux template mapping expectations
- Generated artifacts now properly ignored (.claude/, CLAUDE.md)

## [1.1.0] - 2025-09-08

### Added
- Validation commands for brownfield development ([#56](https://github.com/gotalab/cc-sdd/pull/56))
  - `/kiro:validate-gap` - Analyze implementation gap between requirements and existing codebase
  - `/kiro:validate-design` - Validate design compatibility with existing architecture
  - `/kiro:validate-impl` - Validate implementation against requirements, design, and tasks
- Cursor IDE official support with 11 commands
- AGENTS.md configuration file for Cursor IDE optimization
- Windows template support for Gemini CLI with proper bash -c wrapping ([#56](https://github.com/gotalab/cc-sdd/pull/56))

### Changed
- Command structure expanded from 8 to 11 commands
- Enhanced spec-design with flexible system flows and requirements traceability ([#55](https://github.com/gotalab/cc-sdd/pull/55))
- Improved EARS requirements template with better subject guidance
- Updated documentation for brownfield vs greenfield workflows

### Fixed
- Template parameter replacement across platforms
- OS-specific command handling for Windows environments

**Metrics:**
- Supported Platforms: 5 (Claude Code, Cursor IDE, Gemini CLI, Codex CLI, GitHub Copilot)
- Commands: 11 (6 spec + 3 validate + 2 steering)
- Documentation Languages: 3 (English, Japanese, Traditional Chinese)

**Related PRs:**
- [#56](https://github.com/gotalab/cc-sdd/pull/56) - Reorganize templates by OS and add Gemini CLI support
- [#55](https://github.com/gotalab/cc-sdd/pull/55) - Enhance technical design document generation
- [#54](https://github.com/gotalab/cc-sdd/pull/54) - Improve slash commands with individual arguments
- [#52](https://github.com/gotalab/cc-sdd/pull/52) - Add Cursor agent manifest and CLI support

## [1.0.0] - 2025-08-31

### Added
- Multi-platform support for Spec-Driven Development
  - Claude Code (original platform)
  - Cursor IDE integration
  - Gemini CLI with TOML configuration
  - Codex CLI with GPT-5 optimized prompts
- cc-sdd npm package for easy distribution ([#39](https://github.com/gotalab/cc-sdd/pull/39))
- Complete CLI tool with `npx cc-sdd@latest` installation
- Template system supporting multiple platforms and OS variants
- 8 core commands for spec-driven workflow
  - spec-init, spec-requirements, spec-design, spec-tasks
  - spec-impl, spec-status
  - steering, steering-custom

### Changed
- Complete workflow redesign for spec-driven development
- Unified output format across all platforms
- Individual argument handling (`$1`, `$2`) instead of `$ARGUMENTS` ([#54](https://github.com/gotalab/cc-sdd/pull/54))

### Fixed
- Context creation optimization in template processing ([#45](https://github.com/gotalab/cc-sdd/pull/45))
  - Eliminated redundant `contextFromResolved()` calls
  - Improved performance by 20-50% for template-heavy operations

**Metrics:**
- Supported Platforms: 4 (Claude Code, Cursor, Gemini CLI, Codex CLI)
- Commands: 8
- Documentation Languages: 3

**Related PRs:**
- [#54](https://github.com/gotalab/cc-sdd/pull/54) - Improve slash commands with individual arguments
- [#52](https://github.com/gotalab/cc-sdd/pull/52) - Add Cursor agent support
- [#51](https://github.com/gotalab/cc-sdd/pull/51) - Major enhancement of kiro commands
- [#45](https://github.com/gotalab/cc-sdd/pull/45) - Optimize context creation performance
- [#43](https://github.com/gotalab/cc-sdd/pull/43) - Add CI/CD workflow
- [#42](https://github.com/gotalab/cc-sdd/pull/42) - Refactor README structure
- [#39](https://github.com/gotalab/cc-sdd/pull/39) - Add gemini-cli integration and cc-sdd tool
- [#37](https://github.com/gotalab/cc-sdd/pull/37) - Release v1.0.0-beta.1
- [#36](https://github.com/gotalab/cc-sdd/pull/36) - Initial CLI tool release

## [0.3.0] - 2025-08-12

### Added
- `-y` flag for streamlined workflow approval
  - Skip requirement approval: `/kiro:spec-design feature-name -y`
  - Skip requirement + design approval: `/kiro:spec-tasks feature-name -y`
- Argument hints in command input (`<feature-name> [-y]`)
- Custom Steering support in all spec commands

### Changed
- Optimized command file sizes by 30-36%
  - spec-init.md: 162→104 lines (36% reduction)
  - spec-requirements.md: 177→124 lines (30% reduction)
  - spec-tasks.md: 295→198 lines (33% reduction)
- Task structure optimization
  - Section-based functional grouping
  - Task granularity limits (3-5 sub-items, 1-2 hour completion)
  - Unified requirements reference format

### Removed
- Redundant explanations and template sections
- "Phase X:" prefixes in task organization

## [0.2.1] - 2025-07-27

### Changed
- Optimized CLAUDE.md file size from 150 to 66 lines
- Removed duplicate sections and verbose explanations
- Applied optimization across all language versions (Japanese, English, Traditional Chinese)

### Added
- "think" keyword to spec-requirements.md for better AI reasoning

## [0.2.0] - 2025-07-26

### Added
- Interactive approval system for workflow phases
  - `/kiro:spec-design`: Prompts for requirements review confirmation
  - `/kiro:spec-tasks`: Prompts for requirements + design review confirmation
  - Automatic spec.json updates on 'y' approval
- Enhanced specification generation quality
  - Improved EARS format consistency in requirements.md
  - Research & analysis process in design phase
  - Requirements mapping and traceability in design.md
  - TDD-optimized task structure in tasks.md

### Fixed
- Directory handling when `.kiro/steering/` doesn't exist
- Error messages improved for better clarity

### Changed
- Simplified system design by removing redundant `progress` field
- Reverted to original Kiro design philosophy for requirements generation
- Removed excessive "CRITICAL" and "MUST" language
- Focus on core functionality with iterative improvement

## [0.1.5] - 2025-07-25

### Added
- Security guidelines and content quality guidelines
- Inclusion modes improvements (Always/Conditional/Manual)
- Detailed usage recommendations and guidance

### Changed
- Enhanced `/kiro:steering` command to properly handle existing files
- Improved steering document management

### Fixed
- Claude Code pipe bugs for more reliable execution
- Non-git environment compatibility

## [0.1.0] - 2025-07-18

### Added
- Kiro IDE-style Spec-Driven Development system
- 3-phase approval workflow (Requirements → Design → Tasks → Implementation)
- EARS format requirement definition support
- Hierarchical requirement structure
- Automatic progress tracking and hooks
- Basic Slash Commands set
- Manual approval gates for quality assurance
- Specification compliance checking
- Context preservation functionality

## [0.0.1] - 2025-07-17

### Added
- Initial project structure

---

## Links

- **Repository**: [gotalab/cc-sdd](https://github.com/gotalab/cc-sdd)
- **npm Package**: [cc-sdd](https://www.npmjs.com/package/cc-sdd)
- **Release Notes**:
  - [Japanese](docs/RELEASE_NOTES/RELEASE_NOTES_ja.md)
  - [English](docs/RELEASE_NOTES/RELEASE_NOTES_en.md)
- **Documentation**:
  - [English](tools/cc-sdd/README.md)
  - [Japanese](tools/cc-sdd/README_ja.md)
  - [Traditional Chinese](docs/README/README_zh-TW.md)

---
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
