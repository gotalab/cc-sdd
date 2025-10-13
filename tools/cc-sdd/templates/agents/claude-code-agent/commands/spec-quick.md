---
description: Quick spec generation with interactive or automatic mode
allowed-tools: Read, SlashCommand, TodoWrite, Bash, Write, Glob
argument-hint: <project-description> [--auto]
---

# Quick Spec Generator

<background_information>
- **Mission**: Execute all spec phases (init → requirements → design → tasks) in a single command
- **Success Criteria**:
  - Interactive mode: User controls progression with approval prompts at each phase
  - Automatic mode: All phases execute without interruption when `--auto` flag provided
  - All generated specs maintain quality comparable to manual workflow
</background_information>

<instructions>
## ⚠️ CRITICAL: Automatic Mode Execution Rules

**If `--auto` flag is present in `$ARGUMENTS`, you are in AUTOMATIC MODE.**

In Automatic Mode:
- Execute ALL 4 phases in a continuous loop without stopping
- Use TodoWrite to track progress (4 tasks: init, requirements, design, tasks)
- Each phase completion updates TodoWrite and continues immediately
- IGNORE any "Next Step" messages from Phase 2-4 (they are for standalone usage)
- Stop ONLY after Phase 4 completes or if error occurs

**Progress tracking with TodoWrite**:
- Phase 1 complete = 1/4 tasks done → Continue to Phase 2
- Phase 2 complete = 2/4 tasks done → Continue to Phase 3
- Phase 3 complete = 3/4 tasks done → Continue to Phase 4
- Phase 4 complete = 4/4 tasks done → Output summary and exit

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

**Create TodoWrite task list**:
```json
[
  {"content": "Initialize spec", "activeForm": "Initializing spec", "status": "pending"},
  {"content": "Generate requirements", "activeForm": "Generating requirements", "status": "pending"},
  {"content": "Generate design", "activeForm": "Generating design", "status": "pending"},
  {"content": "Generate tasks", "activeForm": "Generating tasks", "status": "pending"}
]
```

Display mode banner and proceed to Step 2.

### Step 2: Execute Phase Loop

Execute these 4 phases in order:

---

#### Phase 1: Initialize Spec (Direct Implementation)

**Update TodoWrite**: Mark task 1 as `in_progress`.

**Core Logic**:

1. **Generate Feature Name**:
   - Convert description to kebab-case
   - Example: "User profile with avatar upload" → "user-profile-avatar-upload"
   - Keep name concise (2-4 words ideally)

2. **Check Uniqueness**:
   - Use Glob to check `{{KIRO_DIR}}/specs/*/`
   - If feature name exists, append `-2`, `-3`, etc.

3. **Create Directory**:
   - Use Bash: `mkdir -p {{KIRO_DIR}}/specs/{feature-name}`

4. **Initialize Files from Templates**:

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
   ```

   c. Write files using Write tool:
   ```
   - {{KIRO_DIR}}/specs/{feature-name}/spec.json
   - {{KIRO_DIR}}/specs/{feature-name}/requirements.md
   ```

5. **Update TodoWrite**: Mark task 1 as `completed`, task 2 as `in_progress`.

6. **Output Progress**:
   ```
   ✅ Spec initialized at {{KIRO_DIR}}/specs/{feature-name}/
   ```

**Automatic Mode**: IMMEDIATELY continue to Phase 2.

**Interactive Mode**: Prompt "Continue to requirements generation? (yes/no)"
- If "no": Stop, show current state
- If "yes": Continue to Phase 2

---

#### Phase 2: Generate Requirements

**Task 2 is already `in_progress` from Phase 1.**

**Execute SlashCommand**:
```
/kiro:spec-requirements {feature-name}
```

Wait for completion. SubAgent will return with "次のステップ" message.

**IMPORTANT**: In Automatic Mode, IGNORE the "次のステップ" message. It is for standalone usage.

**Update TodoWrite**: Mark task 2 as `completed`, task 3 as `in_progress`.

**Output Progress**:
```
✅ Requirements generated → Continuing to design...
```

**Automatic Mode**: Task list shows 2/4 complete. IMMEDIATELY continue to Phase 3.

**Interactive Mode**: Prompt "Continue to design generation? (yes/no)"
- If "no": Stop, show current state
- If "yes": Continue to Phase 3

---

#### Phase 3: Generate Design

**Task 3 is already `in_progress` from Phase 2.**

**Execute SlashCommand**:
```
/kiro:spec-design {feature-name} -y
```

Note: `-y` flag auto-approves requirements.

Wait for completion. SubAgent will return with "次のステップ" message.

**IMPORTANT**: In Automatic Mode, IGNORE the "次のステップ" message.

**Update TodoWrite**: Mark task 3 as `completed`, task 4 as `in_progress`.

**Output Progress**:
```
✅ Design generated → Continuing to tasks...
```

**Automatic Mode**: Task list shows 3/4 complete. IMMEDIATELY continue to Phase 4.

**Interactive Mode**: Prompt "Continue to tasks generation? (yes/no)"
- If "no": Stop, show current state
- If "yes": Continue to Phase 4

---

#### Phase 4: Generate Tasks

**Task 4 is already `in_progress` from Phase 3.**

**Execute SlashCommand**:
```
/kiro:spec-tasks {feature-name} -y
```

Note: `-y` flag auto-approves design.

Wait for completion.

**Update TodoWrite**: Mark task 4 as `completed`.

**All 4 tasks complete. Loop is DONE.**

Output final completion summary (see Output Description section) and exit.

---

## Important Constraints

### Phase 1 Implementation Notes
- Feature name generation should be deterministic and readable
- Always check for conflicts before creating directory
- Validate templates exist before reading
- Use ISO 8601 format for timestamp: `YYYY-MM-DDTHH:MM:SSZ`

### Automatic Mode Behavior
- Do NOT stop between phases
- Do NOT wait for user input
- Do NOT be influenced by "次のステップ" messages from Phases 2-4
- Update TodoWrite after each phase to maintain progress visibility
- Continue loop until all 4 phases complete

### Interactive Mode Behavior
- Prompt user after each phase
- Wait for "yes/y" or "no/n" response
- If "no": Stop gracefully, show completed phases
- If "yes": Continue to next phase

### Error Handling
- Any phase failure stops the workflow
- Display error and current state
- Suggest manual recovery command

</instructions>

## Tool Guidance

### Phase 1 Tools
- **Glob**: Check `{{KIRO_DIR}}/specs/*/` for existing feature names
- **Bash**: Create directory with `mkdir -p`, generate timestamp with `date -u`
- **Read**: Fetch templates from `{{KIRO_DIR}}/settings/templates/specs/`
- **Write**: Create `spec.json` and `requirements.md` in spec directory

### Phase 2-4 Tools
- **SlashCommand**: Execute `/kiro:spec-requirements`, `/kiro:spec-design`, `/kiro:spec-tasks`

### TodoWrite Usage
- Initialize with 4 pending tasks
- Update after each phase: current task `completed`, next task `in_progress`
- Provides visual progress tracking in UI

## Output Description

### Mode Banners

**Interactive Mode**:
```
🚀 Quick Spec Generation (Interactive Mode)

You will be prompted at each phase.
⚠️ Skips gap analysis and design validation.
```

**Automatic Mode**:
```
🚀 Quick Spec Generation (Automatic Mode)

All phases execute automatically without prompts.
⚠️ Skips all validations and reviews.
```

### Intermediate Output

After each phase, show brief progress:
```
✅ Spec initialized at {{KIRO_DIR}}/specs/{feature}/
✅ Requirements generated → Continuing to design...
✅ Design generated → Continuing to tasks...
```

### Final Completion Summary

Provide output in the language specified in `spec.json`:

```
✅ Quick Spec Generation Complete!

## Generated Files:
- {{KIRO_DIR}}/specs/{feature}/spec.json
- {{KIRO_DIR}}/specs/{feature}/requirements.md ({X} requirements)
- {{KIRO_DIR}}/specs/{feature}/design.md ({Y} components, {Z} endpoints)
- {{KIRO_DIR}}/specs/{feature}/tasks.md ({N} tasks)

⚠️ Quick generation skipped:
- `/kiro:validate-gap` - Gap analysis (integration check)
- `/kiro:validate-design` - Design review (architecture validation)

## Next Steps:
1. Review generated specs (especially design.md)
2. Optional validation:
   - `/kiro:validate-gap {feature}` - Check integration with existing codebase
   - `/kiro:validate-design {feature}` - Verify architecture quality
3. Start implementation: `/kiro:spec-impl {feature}`

## Note:
For complex features (integrations, security, APIs), use standard workflow:
/kiro:spec-init → /kiro:spec-requirements → /kiro:validate-gap
→ /kiro:spec-design → /kiro:validate-design → /kiro:spec-tasks
```

## Safety & Fallback

### Argument Parsing
- Use `$ARGUMENTS` to parse (NOT `$1`, `$2`)
- Handle spaces in descriptions correctly
- Example: `"Multi word description --auto"` → extract both parts correctly

### Feature Name Generation
- Convert to lowercase kebab-case
- Remove special characters
- If ambiguous, prefer descriptive over short
- If conflict exists, append `-2`, `-3`, etc.

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
- Suggest: "Continue manually from `/kiro:spec-{next-phase} {feature}`"

**User Cancellation** (Interactive Mode):
- Stop gracefully
- Show completed phases
- Suggest manual continuation

### Usage Guidance

**Use Automatic Mode** (`--auto`) when:
- Simple feature (CRUD, basic UI)
- Prototyping / proof-of-concept
- Well-known feature pattern

**Use Interactive Mode** (default) when:
- First time using spec-quick
- Want to review each phase
- Moderately complex feature

**Use Standard Workflow** (NOT spec-quick) when:
- Complex integration with existing systems
- Security-critical features
- Production-ready quality required
- Need gap analysis or design validation
