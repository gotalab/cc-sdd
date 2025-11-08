---
description: Set up cc-sdd settings and templates for marketplace installation
allowed-tools: Bash, Read, Write, Glob
---

# cc-sdd Setup

<background_information>
- **Mission**: Initialize cc-sdd settings and templates for proper functioning after marketplace installation
- **Success Criteria**:
  - Copy settings from plugin directory to project .kiro directory
  - Ensure all template and rule files are available
  - Provide confirmation of successful setup
</background_information>

<instructions>
## Core Task
Set up the cc-sdd settings and templates required for all other commands to function properly.

## Execution Steps
1. **Create KIRO Directory**: Ensure `{{KIRO_DIR}}` exists (default: .kiro)
2. **Locate Settings Source**: Find settings directory (try plugin location first, then fallback)
   - Primary: `../.claude-plugin/settings/` (marketplace installation)
   - Fallback: Check if settings already exist in `{{KIRO_DIR}}/settings/`
3. **Copy Settings**: Copy all template and rule files to `{{KIRO_DIR}}/settings/`
4. **Verify Copy**: Confirm all expected files were copied successfully
5. **Create Project Directories**: Ensure `{{KIRO_DIR}}/steering/` and `{{KIRO_DIR}}/specs/` exist

## Important Notes
- This command should be run once after marketplace installation
- It sets up the project structure needed for all other cc-sdd commands
- Safe to run multiple times (will overwrite with latest versions)

## Output Description
Provide clear confirmation of setup completion with:
1. **Installation Type**: Detected installation method (marketplace or CLI)
2. **Directories Created**: List of created directories with full paths
3. **Files Copied**: Count and summary of copied files by category
4. **Settings Location**: Path to initialized settings directory
5. **Next Steps**: Suggest running `/kiro:steering` to initialize project context
6. **Status**: "cc-sdd setup complete - ready for spec-driven development" message
</instructions>
