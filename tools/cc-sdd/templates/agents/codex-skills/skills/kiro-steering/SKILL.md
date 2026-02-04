---
name: kiro-steering
description: Create or update project steering docs in {{KIRO_DIR}}/steering/ as persistent project memory (product, tech, structure, and custom files).
metadata:
  short-description: Update steering
---

# Kiro Steering

## Usage

- Invoke: `$kiro-steering`

## Procedure

1. Detect scenario:
   - Bootstrap: steering missing/empty
   - Sync: steering exists (update additively)
2. Read templates/rules:
   - `{{KIRO_DIR}}/settings/templates/steering/*`
   - `{{KIRO_DIR}}/settings/rules/steering-principles.md`
3. Analyze the codebase just-in-time (search/read) to capture patterns, not catalogs.
4. Write/update `{{KIRO_DIR}}/steering/*.md` additively; preserve user customizations.

## Output

- Summarize what changed and highlight any drift or follow-up recommendations.

