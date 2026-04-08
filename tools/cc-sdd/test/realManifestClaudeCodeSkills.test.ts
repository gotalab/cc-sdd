import { describe, it, expect } from 'vitest';
import { runCli } from '../src/index';
import { mkdtemp, readFile, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const runtime = { platform: 'darwin' } as const;

const makeIO = () => {
  const logs: string[] = [];
  const errs: string[] = [];
  return {
    io: {
      log: (m: string) => logs.push(m),
      error: (m: string) => errs.push(m),
      exit: (_c: number) => {},
    },
    get logs() {
      return logs;
    },
    get errs() {
      return errs;
    },
  };
};

const mkTmp = async () => mkdtemp(join(tmpdir(), 'ccsdd-real-manifest-'));
const exists = async (p: string) => { try { await stat(p); return true; } catch { return false; } };

// vitest runs in tools/cc-sdd; repoRoot is two levels up
const repoRoot = join(process.cwd(), '..', '..');
const manifestPath = join(repoRoot, 'tools/cc-sdd/templates/manifests/claude-code-skills.json');

describe('real claude-code-skills manifest', () => {
  it('dry-run prints plan for claude-code-skills.json with placeholders applied', async () => {
    const ctx = makeIO();
    const code = await runCli(['--dry-run', '--lang', 'en', '--manifest', manifestPath, '--claude-skills'], runtime, ctx.io, {});
    expect(code).toBe(0);
    const out = ctx.logs.join('\n');
    expect(out).toMatch(/Plan \(dry-run\)/);
    expect(out).toContain('[templateDir] skills: templates/agents/claude-code-skills/skills -> .claude/skills');
    expect(out).toContain('[templateFile] doc_main: templates/agents/claude-code-skills/docs/CLAUDE.md -> ./CLAUDE.md');
    expect(out).toContain('[templateDir] settings_templates: templates/shared/settings/templates -> .kiro/settings/templates');
  });

  it('apply writes CLAUDE.md, skill files to cwd', async () => {
    const cwd = await mkTmp();
    const ctx = makeIO();
    const code = await runCli(['--lang', 'en', '--manifest', manifestPath, '--overwrite=force', '--claude-skills'], runtime, ctx.io, {}, { cwd, templatesRoot: process.cwd() });
    expect(code).toBe(0);

    const doc = join(cwd, 'CLAUDE.md');
    expect(await exists(doc)).toBe(true);
    const text = await readFile(doc, 'utf8');
    expect(text).toMatch(/# AI-DLC and Spec-Driven Development/);
    expect(text).toContain('/kiro-spec-status');
    expect(text).not.toContain('/kiro:spec-status');
    expect(text).toContain('autonomous mode');

    const skillSpecInit = join(cwd, '.claude/skills/kiro-spec-init/SKILL.md');
    expect(await exists(skillSpecInit)).toBe(true);
    const skillSpecInitText = await readFile(skillSpecInit, 'utf8');
    expect(skillSpecInitText).toMatch(/name: kiro-spec-init/);
    expect(skillSpecInitText).toContain('/kiro-spec-requirements');

    const skillSpecDesign = join(cwd, '.claude/skills/kiro-spec-design/SKILL.md');
    expect(await exists(skillSpecDesign)).toBe(true);
    const skillSpecDesignText = await readFile(skillSpecDesign, 'utf8');
    expect(skillSpecDesignText).not.toMatch(/context: fork/);
    expect(skillSpecDesignText).toContain('Parallel Research');
    expect(skillSpecDesignText).toContain('Core steering context: `product.md`, `tech.md`, `structure.md`');
    expect(skillSpecDesignText).toContain('Step 5: Review Design Draft');
    expect(skillSpecDesignText).toContain('Keep the review bounded to at most 2 repair passes');
    expect(skillSpecDesignText).toContain('Spec Gap Found During Design Review');

    const skillValidateImpl = join(cwd, '.claude/skills/kiro-validate-impl/SKILL.md');
    expect(await exists(skillValidateImpl)).toBe(true);
    const skillValidateImplText = await readFile(skillValidateImpl, 'utf8');
    expect(skillValidateImplText).toContain('Validate feature-level integration');
    expect(skillValidateImplText).toContain('Cross-Task Integration');
    expect(skillValidateImplText).toContain('Requirements Coverage Gaps');
    expect(skillValidateImplText).toContain('do NOT invent `REQ-*` aliases');
    expect(skillValidateImplText).toContain('Core steering context: `product.md`, `tech.md`, `structure.md`');
    expect(skillValidateImplText).toContain('MANUAL_VERIFY_REQUIRED');
    expect(skillValidateImplText).toContain('Does NOT Do');

    const skillValidateDesign = join(cwd, '.claude/skills/kiro-validate-design/SKILL.md');
    expect(await exists(skillValidateDesign)).toBe(true);
    const skillValidateDesignText = await readFile(skillValidateDesign, 'utf8');
    expect(skillValidateDesignText).toContain('Core steering context: `product.md`, `tech.md`, `structure.md`');
    expect(skillValidateDesignText).toContain('review-relevant steering or use-case-aligned local agent skills/playbooks');

    const skillValidateGap = join(cwd, '.claude/skills/kiro-validate-gap/SKILL.md');
    expect(await exists(skillValidateGap)).toBe(true);
    const skillValidateGapText = await readFile(skillValidateGap, 'utf8');
    expect(skillValidateGapText).toContain('Core steering context: `product.md`, `tech.md`, `structure.md`');
    expect(skillValidateGapText).toContain('analysis-relevant steering or use-case-aligned local agent skills/playbooks');

    const skillSpecRequirements = join(cwd, '.claude/skills/kiro-spec-requirements/SKILL.md');
    expect(await exists(skillSpecRequirements)).toBe(true);
    const skillSpecRequirementsText = await readFile(skillSpecRequirements, 'utf8');
    expect(skillSpecRequirementsText).toContain('Core steering context: `product.md`, `tech.md`, `structure.md`');
    expect(skillSpecRequirementsText).toContain('Additional steering files only when directly relevant');
    expect(skillSpecRequirementsText).toContain('Step 4: Review Requirements Draft');
    expect(skillSpecRequirementsText).toContain('requirements review gate passes');
    expect(skillSpecRequirementsText).toContain('Missing Project Description');

    // kiro-impl skill with subagent dispatch
    const skillImpl = join(cwd, '.claude/skills/kiro-impl/SKILL.md');
    expect(await exists(skillImpl)).toBe(true);
    const skillImplText = await readFile(skillImpl, 'utf8');
    expect(skillImplText).toMatch(/name: kiro-impl/);
    expect(skillImplText).toContain('Agent tool');
    expect(skillImplText).toContain('Autonomous mode');
    expect(skillImplText).toContain('Manual mode');
    expect(skillImplText).toContain('Feature Flag Protocol');
    expect(skillImplText).toContain('kiro-validate-impl');
    expect(skillImplText).toContain('BLOCKED');
    expect(skillImplText).toContain('Bounded Remediation');
    expect(skillImplText).toContain('Parse implementer status only from the exact `## Status Report` block');
    expect(skillImplText).toContain('Parse reviewer verdict only from the exact `## Review Verdict` block');
    expect(skillImplText).toContain('Strict Handoff Parsing');
    expect(skillImplText).toContain('No Destructive Reset');
    expect(skillImplText).toContain('stop the feature run');
    expect(skillImplText).not.toContain('discard the failed implementation (`git checkout .`)');

    const implPrompt = join(cwd, '.claude/skills/kiro-impl/templates/implementer-prompt.md');
    expect(await exists(implPrompt)).toBe(true);
    const implPromptText = await readFile(implPrompt, 'utf8');
    expect(implPromptText).toContain('TDD');
    expect(implPromptText).toContain('STATUS: READY_FOR_REVIEW');
    expect(implPromptText).toContain('Do NOT update `tasks.md`');
    expect(implPromptText).toContain('Do NOT create commits');
    expect(implPromptText).toContain('The parent controller parses the exact `- STATUS:` line');
    expect(skillImplText).toContain('Only after review returns `APPROVED`');

    const reviewPrompt = join(cwd, '.claude/skills/kiro-impl/templates/reviewer-prompt.md');
    expect(await exists(reviewPrompt)).toBe(true);
    const reviewPromptText = await readFile(reviewPrompt, 'utf8');
    expect(reviewPromptText).toContain('Apply the `kiro-review` protocol');
    expect(reviewPromptText).toContain('Reality Check');
    expect(reviewPromptText).toContain('APPROVED');
    expect(reviewPromptText).toContain('REJECTED');
    expect(reviewPromptText).toContain('Do Not Trust the Report');
    expect(reviewPromptText).toContain('mechanical checks');
    expect(reviewPromptText).toContain('The parent controller parses the exact `- VERDICT:` line');

    const debugPrompt = join(cwd, '.claude/skills/kiro-impl/templates/debugger-prompt.md');
    expect(await exists(debugPrompt)).toBe(true);
    const debugPromptText = await readFile(debugPrompt, 'utf8');
    expect(debugPromptText).toContain('Apply the `kiro-debug` protocol');
    expect(debugPromptText).toContain('web or official docs research');
    expect(debugPromptText).toContain('repo-fixability judgment');

    const skillReview = join(cwd, '.claude/skills/kiro-review/SKILL.md');
    expect(await exists(skillReview)).toBe(true);
    const skillReviewText = await readFile(skillReview, 'utf8');
    expect(skillReviewText).toContain('task-local adversarial review');
    expect(skillReviewText).toContain('RED phase');
    expect(skillReviewText).toContain('MECHANICAL_RESULTS');

    const skillDebug = join(cwd, '.claude/skills/kiro-debug/SKILL.md');
    expect(await exists(skillDebug)).toBe(true);
    const skillDebugText = await readFile(skillDebug, 'utf8');
    expect(skillDebugText).toContain('root cause investigation');
    expect(skillDebugText).toContain('Search the Web if Available');
    expect(skillDebugText).toContain('NEXT_ACTION: RETRY_TASK | BLOCK_TASK | STOP_FOR_HUMAN');
    expect(skillDebugText).toContain('TASK_ORDERING_PROBLEM');

    const skillVerifyCompletion = join(cwd, '.claude/skills/kiro-verify-completion/SKILL.md');
    expect(await exists(skillVerifyCompletion)).toBe(true);
    const skillVerifyCompletionText = await readFile(skillVerifyCompletion, 'utf8');
    expect(skillVerifyCompletionText).toContain('fresh evidence');
    expect(skillVerifyCompletionText).toContain('FEATURE_GO');
    expect(skillVerifyCompletionText).toContain('MANUAL_VERIFY_REQUIRED');

    // Shared rules resolved from templates/shared/settings/rules/
    const designRules = [
      'design-principles.md',
      'design-discovery-full.md',
      'design-discovery-light.md',
      'design-synthesis.md',
      'design-review-gate.md',
    ];
    for (const rule of designRules) {
      expect(await exists(join(cwd, `.claude/skills/kiro-spec-design/rules/${rule}`))).toBe(true);
    }
    expect(await exists(join(cwd, '.claude/skills/kiro-validate-design/rules/design-review.md'))).toBe(true);
    expect(await exists(join(cwd, '.claude/skills/kiro-spec-requirements/rules/ears-format.md'))).toBe(true);
    expect(await exists(join(cwd, '.claude/skills/kiro-spec-requirements/rules/requirements-review-gate.md'))).toBe(true);
    expect(await exists(join(cwd, '.claude/skills/kiro-validate-gap/rules/gap-analysis.md'))).toBe(true);
    expect(await exists(join(cwd, '.claude/skills/kiro-steering/rules/steering-principles.md'))).toBe(true);
    expect(await exists(join(cwd, '.claude/skills/kiro-steering-custom/rules/steering-principles.md'))).toBe(true);
    expect(await exists(join(cwd, '.claude/skills/kiro-spec-tasks/rules/tasks-generation.md'))).toBe(true);
    expect(await exists(join(cwd, '.claude/skills/kiro-spec-tasks/rules/tasks-parallel-analysis.md'))).toBe(true);
    const skillSpecTasks = join(cwd, '.claude/skills/kiro-spec-tasks/SKILL.md');
    const skillSpecTasksText = await readFile(skillSpecTasks, 'utf8');
    expect(skillSpecTasksText).toContain('Core steering context: `product.md`, `tech.md`, `structure.md`');
    expect(skillSpecTasksText).toContain('Step 3: Review Task Plan');
    expect(skillSpecTasksText).toContain('Keep the review bounded to at most 2 repair passes');
    expect(skillSpecTasksText).toContain('Spec Gap Found During Task Review');
    const tasksGenerationRules = await readFile(join(cwd, '.claude/skills/kiro-spec-tasks/rules/tasks-generation.md'), 'utf8');
    expect(tasksGenerationRules).toContain('## Task Plan Review Gate');
    expect(tasksGenerationRules).toContain('### Coverage Review');
    expect(tasksGenerationRules).toContain('### Executability Review');
    expect(tasksGenerationRules).toContain('no more than 2 review-and-repair passes');
    const designReviewGate = await readFile(join(cwd, '.claude/skills/kiro-spec-design/rules/design-review-gate.md'), 'utf8');
    expect(designReviewGate).toContain('## Requirements Coverage Review');
    expect(designReviewGate).toContain('## Architecture Readiness Review');
    expect(designReviewGate).toContain('## Executability Review');
    const requirementsReviewGate = await readFile(join(cwd, '.claude/skills/kiro-spec-requirements/rules/requirements-review-gate.md'), 'utf8');
    expect(requirementsReviewGate).toContain('## Scope and Coverage Review');
    expect(requirementsReviewGate).toContain('## EARS and Testability Review');
    expect(requirementsReviewGate).toContain('## Structure and Quality Review');

    // Skills without shared-rules should NOT have rules/ directories
    const noRulesSkills = [
      'kiro-spec-init',
      'kiro-spec-status',
      'kiro-spec-quick',
      'kiro-spec-batch',
      'kiro-impl',
      'kiro-validate-impl',
      'kiro-discovery',
      'kiro-review',
      'kiro-debug',
      'kiro-verify-completion',
    ];
    for (const skill of noRulesSkills) {
      expect(await exists(join(cwd, `.claude/skills/${skill}/rules`))).toBe(false);
    }

    const settingsRuleDir = join(cwd, '.kiro/settings/rules');
    expect(await exists(settingsRuleDir)).toBe(false);

    expect(ctx.logs.join('\n')).toMatch(/\d+\/\d+ files written/);
  });

  it('generates exactly 17 skill directories', async () => {
    const cwd = await mkTmp();
    const ctx = makeIO();
    await runCli(['--lang', 'en', '--manifest', manifestPath, '--overwrite=force', '--claude-skills'], runtime, ctx.io, {}, { cwd, templatesRoot: process.cwd() });

    const expectedSkills = [
      'kiro-debug',
      'kiro-discovery',
      'kiro-review',
      'kiro-spec-batch',
      'kiro-spec-init',
      'kiro-spec-status',
      'kiro-spec-quick',
      'kiro-spec-design',
      'kiro-spec-requirements',
      'kiro-spec-tasks',
      'kiro-impl',
      'kiro-steering',
      'kiro-steering-custom',
      'kiro-validate-design',
      'kiro-validate-gap',
      'kiro-validate-impl',
      'kiro-verify-completion',
    ];

    for (const skill of expectedSkills) {
      const skillPath = join(cwd, `.claude/skills/${skill}/SKILL.md`);
      expect(await exists(skillPath)).toBe(true);
    }

    // kiro-impl has prompt templates
    expect(await exists(join(cwd, '.claude/skills/kiro-impl/templates/implementer-prompt.md'))).toBe(true);
    expect(await exists(join(cwd, '.claude/skills/kiro-impl/templates/reviewer-prompt.md'))).toBe(true);
    expect(await exists(join(cwd, '.claude/skills/kiro-impl/templates/debugger-prompt.md'))).toBe(true);

    // No agents directory (tdd-task-implementer removed)
    expect(await exists(join(cwd, '.claude/agents'))).toBe(false);
  });
});
