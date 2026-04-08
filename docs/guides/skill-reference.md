# Skill Reference

> 📖 **日本語ガイドはこちら:** [スキルリファレンス (日本語)](ja/skill-reference.md)

Reference for the skills-mode workflow in cc-sdd. Use this guide when you installed a skills-mode agent such as `--claude-skills`, `--codex-skills`, `--cursor-skills`, `--copilot-skills`, `--windsurf-skills`, `--opencode-skills`, `--gemini-skills`, or `--antigravity`.

If you are using legacy `/kiro:*` commands, use the [Command Reference](command-reference.md) instead.

## Start Here

Use this table when you are deciding which skill to run first.

| You want to... | Start with | Typical next step |
| --- | --- | --- |
| Route a new request | `/kiro-discovery` | `kiro-spec-init`, `kiro-spec-batch`, or direct implementation |
| Create one new spec | `/kiro-spec-init` | `/kiro-spec-requirements` |
| Create many specs from one initiative | `/kiro-spec-batch` | Review generated specs, then `/kiro-impl` on the approved one(s) |
| Implement approved tasks | `/kiro-impl` | `/kiro-validate-impl` |
| Validate feature integration | `/kiro-validate-impl` | Fix findings or report `GO` / `NO-GO` / `MANUAL_VERIFY_REQUIRED` |
| Capture project memory | `/kiro:steering` or `/kiro:steering-custom` | Start or resume spec work |

## Workflow Skills

### `/kiro-discovery`

Use when you have new work but do not yet know whether it should become one spec, multiple specs, or no spec at all.

- What it does:
  - routes the request
  - refines scope
  - writes `brief.md` and, when needed, `roadmap.md`
  - suggests the next command and stops
- Typical outcomes:
  - extend an existing spec
  - implement directly with no spec
  - create one new spec
  - decompose into multiple specs

### `/kiro-spec-batch`

Use when discovery or a roadmap already tells you the work should be split into multiple specs.

- What it does:
  - creates multiple specs in parallel
  - keeps cross-spec consistency
  - prepares a roadmap-shaped backlog instead of one oversized spec
- Typical next step:
  - review the generated specs
  - continue with the approved spec(s)

### `/kiro-impl`

Use when `tasks.md` is approved and you want to execute implementation.

- Modes:
  - autonomous mode: no task args, one task per iteration, fresh implementer + reviewer + debugger
  - manual mode: task args provided, TDD in main context with review gate
- Guarantees:
  - reviewer approval before completion
  - `kiro-verify-completion` before success claims
  - bounded remediation and debug loops

### `/kiro-validate-impl`

Use after implementation when you need feature-level validation across tasks.

- What it checks:
  - integration across tasks
  - requirements coverage
  - design alignment
  - full-suite evidence
- Possible outcomes:
  - `GO`
  - `NO-GO`
  - `MANUAL_VERIFY_REQUIRED`

## Supporting Skills

These are real skills, but many users meet them indirectly through `/kiro-impl`.

### `kiro-review`

Task-local adversarial review protocol.

- Used by:
  - reviewer subagents in autonomous mode
  - manual-mode review gate
- Checks:
  - spec compliance
  - boundary fit
  - mechanical verification
  - RED-phase evidence where required

### `kiro-debug`

Root-cause-first debug protocol.

- Used when:
  - implementer is blocked
  - reviewer rejection loops do not converge
  - validation uncovers a deeper issue
- Returns:
  - `ROOT_CAUSE`
  - `CATEGORY`
  - `FIX_PLAN`
  - `NEXT_ACTION`

### `kiro-verify-completion`

Fresh-evidence gate before success claims.

- Used before:
  - marking tasks complete
  - saying a fix works
  - reporting feature success
- Returns:
  - `VERIFIED`
  - `NOT_VERIFIED`
  - `MANUAL_VERIFY_REQUIRED`

## Skills vs Commands

| Area | Skills mode | Legacy commands |
| --- | --- | --- |
| New-work entry point | `/kiro-discovery` | none |
| Multi-spec creation | `/kiro-spec-batch` | none |
| Implementation | `/kiro-impl` | `/kiro:spec-impl` |
| Integration validation | `/kiro-validate-impl` | `/kiro:validate-impl` |
| Review/debug/completion gates | explicit skills | embedded in command flow or external process |

## Recommended Reading Order

1. [Spec-Driven Development Workflow](spec-driven.md)
2. This skill reference
3. [Command Reference](command-reference.md) only if you need legacy mode

