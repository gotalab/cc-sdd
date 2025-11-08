# cc-sdd-claude-code

**Spec-Driven Development for Claude Code**

AI-DLC (AI Development Life Cycle) methodology with human approval gates, specialized agents, and systematic development workflows. Transform Claude Code into a production-ready development environment with structured spec-driven processes.

## Installation

### Marketplace Installation (Recommended)

```bash
# Add the cc-sdd marketplace
claude /plugin marketplace add https://github.com/gotalab/cc-sdd

# Install the Claude Code plugin
claude /plugin install cc-sdd-claude-code

# Initialize settings and templates (run once)
claude /kiro:setup
```

### Alternative: Traditional CLI Installation

For full project setup with all features:
```bash
npx cc-sdd@latest --claude-code
```

> **Note**: The `/kiro:setup` command copies required templates and rules to your project. Run it once after marketplace installation.

## Project Context

### Paths
- Steering: `{{KIRO_DIR}}/steering/`
- Specs: `{{KIRO_DIR}}/specs/`

### Steering vs Specification

**Steering** (`{{KIRO_DIR}}/steering/`) - Guide AI with project-wide rules and context
**Specs** (`{{KIRO_DIR}}/specs/`) - Formalize development process for individual features

### Active Specifications
- Check `{{KIRO_DIR}}/specs/` for active specifications
- Use `/kiro:spec-status [feature-name]` to check progress

## Development Guidelines
{{DEV_GUIDELINES}}

## Minimal Workflow
- Phase 0 (optional): `/kiro:steering`, `/kiro:steering-custom`
- Phase 1 (Specification):
  - `/kiro:spec-init "description"`
  - `/kiro:spec-requirements {feature}`
  - `/kiro:validate-gap {feature}` (optional: for existing codebase)
  - `/kiro:spec-design {feature} [-y]`
  - `/kiro:validate-design {feature}` (optional: design review)
  - `/kiro:spec-tasks {feature} [-y]`
- Phase 2 (Implementation): `/kiro:spec-impl {feature} [tasks]`
  - `/kiro:validate-impl {feature}` (optional: after implementation)
- Progress check: `/kiro:spec-status {feature}` (use anytime)

## Development Rules
- 3-phase approval workflow: Requirements → Design → Tasks → Implementation
- Human review required each phase; use `-y` only for intentional fast-track
- Keep steering current and verify alignment with `/kiro:spec-status`

## Steering Configuration
- Load entire `{{KIRO_DIR}}/steering/` as project memory
- Default files: `product.md`, `tech.md`, `structure.md`
- Custom files are supported (managed via `/kiro:steering-custom`)

## Troubleshooting

### Setup Issues
- **Command not found**: Ensure `/kiro:setup` completed successfully
- **Settings not found**: Run `/kiro:setup` to initialize project templates
- **Permission errors**: Check write permissions in project directory

### Workflow Issues
- **Spec commands fail**: Verify `{{KIRO_DIR}}/settings/` exists (run `/kiro:setup`)
- **Agent not responding**: Check agent permissions and tool access
- **Template errors**: Ensure all required template files are present

### Getting Help
- Check `{{KIRO_DIR}}/specs/` for active specifications
- Use `/kiro:spec-status [feature-name]` to check progress
- Review steering files in `{{KIRO_DIR}}/steering/` for context

