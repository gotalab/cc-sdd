---
name: kiro-spec-quick
description: Quick spec generation with interactive or automatic mode
---

# Quick Spec Generator

<instructions>
## CRITICAL: Automatic Mode Execution Rules

**If `--auto` flag is present in `$ARGUMENTS`, you are in AUTOMATIC MODE.**

In Automatic Mode:
- Execute ALL 4 phases in a continuous loop without stopping
- Display progress after each phase (e.g., "Phase 1/4 complete: spec initialized")
- IGNORE any "Next Step" messages from Phase 2-4 (they are for standalone usage)
- Stop ONLY after Phase 4 completes or if error occurs

---

## Core Task
Execute 4 spec phases sequentially. In automatic mode, execute all phases without stopping. In interactive mode, prompt user for approval between phases.

## Execution Steps

### Step 1: Parse Arguments and Initialize

Parse `$ARGUMENTS`:
- If contains `--auto`: **Automatic Mode** (execute all 4 phases)
- Otherwise: **Interactive Mode** (prompt at each phase)
- Extract description (remove `--auto` flag if present)

Example:
```
"User profile with avatar upload --auto" → mode=automatic, description="User profile with avatar upload"
"User profile feature" → mode=interactive, description="User profile feature"
```

Display mode banner and proceed to Step 2.

### Step 2: Execute Phase Loop

Execute these 4 phases in order:

---

#### Phase 1: Initialize Spec (Direct Implementation)

**Core Logic**:

1. **Check for Brief**:
   - If `{{KIRO_DIR}}/specs/{feature-name}/brief.md` exists (created by `@kiro-brainstorm`), read it for brainstorm context (problem, approach, scope, constraints)
   - Use brief content as the project description instead of `$ARGUMENTS`

2. **Generate Feature Name**:
   - Convert description to kebab-case
   - Example: "User profile with avatar upload" → "user-profile-avatar-upload"
   - Keep name concise (2-4 words ideally)

3. **Check Uniqueness**:
   - Use Glob to check `{{KIRO_DIR}}/specs/*/`
   - If directory exists with only `brief.md` (no `spec.json`), use that directory (brainstorm created it)
   - Otherwise if feature name exists, append `-2`, `-3`, etc.

4. **Create Directory**:
   - Use Bash: `mkdir -p {{KIRO_DIR}}/specs/{feature-name}` (skip if already exists from brainstorm)

5. **Initialize Files from Templates**:

   a. Read templates:
   ```
   - {{KIRO_DIR}}/settings/templates/specs/init.json
   - {{KIRO_DIR}}/settings/templates/specs/requirements-init.md
   ```

   b. Replace placeholders:
   ```
   {{FEATURE_NAME}} → feature-name
   {{TIMESTAMP}} → current ISO 8601 timestamp (use `date -u +"%Y-%m-%dT%H:%M:%SZ"`)
   {{PROJECT_DESCRIPTION}} → description
   {{LANG_CODE}} → language code (detect from user's input language, default to `en`)
   ```

   c. Write files using Write tool:
   ```
   - {{KIRO_DIR}}/specs/{feature-name}/spec.json
   - {{KIRO_DIR}}/specs/{feature-name}/requirements.md
   ```

6. **Output Progress**: "Phase 1/4 complete: Spec initialized at {{KIRO_DIR}}/specs/{feature-name}/"

**Automatic Mode**: IMMEDIATELY continue to Phase 2.

**Interactive Mode**: Prompt "Continue to requirements generation? (yes/no)"
- If "no": Stop, show current state
- If "yes": Continue to Phase 2

---

#### Phase 2: Generate Requirements

Invoke `@kiro-spec-requirements {feature-name}`.

Wait for completion. IGNORE any "Next Step" message (it is for standalone usage).

**Output Progress**: "Phase 2/4 complete: Requirements generated"

**Automatic Mode**: IMMEDIATELY continue to Phase 3.

**Interactive Mode**: Prompt "Continue to design generation? (yes/no)"
- If "no": Stop, show current state
- If "yes": Continue to Phase 3

---

#### Phase 3: Generate Design

Invoke `@kiro-spec-design {feature-name} -y`. The `-y` flag auto-approves requirements.

Wait for completion. IGNORE any "Next Step" message.

**Output Progress**: "Phase 3/4 complete: Design generated"

**Automatic Mode**: IMMEDIATELY continue to Phase 4.

**Interactive Mode**: Prompt "Continue to tasks generation? (yes/no)"
- If "no": Stop, show current state
- If "yes": Continue to Phase 4

---

#### Phase 4: Generate Tasks

Invoke `@kiro-spec-tasks {feature-name} -y`. The `-y` flag auto-approves requirements, design, and tasks.

Wait for completion.

**Output Progress**: "Phase 4/4 complete: Tasks generated"

**All 4 phases complete. Loop is DONE.**

Output final completion summary (see Output Description section) and exit.

---

## Important Constraints

### Error Handling
- Any phase failure stops the workflow
- Display error and current state
- Suggest manual recovery command

</instructions>

## Output Description

### Mode Banners

**Interactive Mode**:
```
Quick Spec Generation (Interactive Mode)

You will be prompted at each phase.
Note: Skips gap analysis and design validation.
```

**Automatic Mode**:
```
Quick Spec Generation (Automatic Mode)

All phases execute automatically without prompts.
Note: Skips optional validations (gap analysis, design review) and user approval prompts. Internal review gates still run.
```

### Intermediate Output

After each phase, show brief progress:
```
Spec initialized at {{KIRO_DIR}}/specs/{feature}/
Requirements generated → Continuing to design...
Design generated → Continuing to tasks...
```

### Final Completion Summary

Provide output in the language specified in `spec.json`:

```
Quick Spec Generation Complete!

## Generated Files:
- {{KIRO_DIR}}/specs/{feature}/spec.json
- {{KIRO_DIR}}/specs/{feature}/requirements.md ({X} requirements)
- {{KIRO_DIR}}/specs/{feature}/design.md ({Y} components, {Z} endpoints)
- {{KIRO_DIR}}/specs/{feature}/tasks.md ({N} tasks)

Quick generation skipped:
- `@kiro-validate-gap` - Gap analysis (integration check)
- `@kiro-validate-design` - Design review (architecture validation)

## Next Steps:
1. Review generated specs (especially design.md)
2. Optional validation:
   - `@kiro-validate-gap {feature}` - Check integration with existing codebase
   - `@kiro-validate-design {feature}` - Verify architecture quality
3. Start implementation: `@kiro-impl {feature}`

```

## Safety & Fallback

### Error Scenarios

**Template Missing**:
- Check `{{KIRO_DIR}}/settings/templates/specs/` exists
- Report specific missing file
- Exit with error

**Directory Creation Failed**:
- Check permissions
- Report error with path
- Exit with error

**Phase Execution Failed** (Phase 2-4):
- Stop workflow
- Show current state and completed phases
- Suggest: "Continue manually from `@kiro-spec-{next-phase} {feature}`"

**User Cancellation** (Interactive Mode):
- Stop gracefully
- Show completed phases
- Suggest manual continuation

