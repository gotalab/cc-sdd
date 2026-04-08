# Agent Plan Output Checklist

Use this checklist before completing the planning phase.

## Required Output File

- `docs/cc-sdd/plans/agent-plan-{agent-id}.md` exists
- File is based on `docs/cc-sdd/templates/agent-plan-template.md`

## Required Sections

1. Research summary
- Commands directory
- Agent directory (or explicit non-support)
- Documentation file name
- Invocation syntax
- YAML/frontmatter schema
- Placeholder or arguments syntax

2. Pattern gap analysis
- Nearest existing agent pattern named explicitly
- Concrete diffs listed (layout, syntax, metadata)

3. Implementation plan
- 5 implementation steps from SOP mapped to concrete files

4. Change list
- Files to edit
- Files to create
- Expected file counts where relevant

5. Verification plan
- `npm test`
- build + dry-run
- temp directory apply test
- language option checks (`ja`, `en`)
- file count and destination checks

## Migration-Specific Additions

When scope includes migration to skills:
- state strategy: additive (`{agent-id}-skills`) or in-place replacement
- compatibility impact
- CLI flag changes
- rollback approach

## Done Criteria

Only move to implementation after:
- all sections above are present
- unresolved assumptions are clearly marked
