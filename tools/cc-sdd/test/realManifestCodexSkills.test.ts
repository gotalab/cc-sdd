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

const mkTmp = async () => mkdtemp(join(tmpdir(), 'ccsdd-real-manifest-codex-skills-'));
const exists = async (p: string) => {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
};

// vitest runs in tools/cc-sdd; repoRoot is two levels up
const repoRoot = join(process.cwd(), '..', '..');
const manifestPath = join(repoRoot, 'tools/cc-sdd/templates/manifests/codex-skills.json');

describe('real codex-skills manifest', () => {
  it('dry-run prints plan for codex-skills.json with placeholders applied', async () => {
    const ctx = makeIO();
    const code = await runCli(
      ['--dry-run', '--lang', 'en', '--agent', 'codex-skills', '--manifest', manifestPath],
      runtime,
      ctx.io,
      {},
    );
    expect(code).toBe(0);
    const out = ctx.logs.join('\n');
    expect(out).toMatch(/Plan \(dry-run\)/);
    expect(out).toContain('[templateDir] skills: templates/agents/codex-skills/skills -> .agents/skills');
    expect(out).toContain('[templateFile] doc_main: templates/agents/codex-skills/docs/AGENTS.md -> ./AGENTS.md');
    expect(out).toContain('[templateDir] settings_templates: templates/shared/settings/templates -> .kiro/settings/templates');
  });

  it('apply writes AGENTS.md, skill files, and settings to cwd', async () => {
    const cwd = await mkTmp();
    const ctx = makeIO();
    const code = await runCli(
      ['--lang', 'en', '--agent', 'codex-skills', '--manifest', manifestPath, '--overwrite=force'],
      runtime,
      ctx.io,
      {},
      { cwd, templatesRoot: process.cwd() },
    );
    expect(code).toBe(0);

    const doc = join(cwd, 'AGENTS.md');
    expect(await exists(doc)).toBe(true);
    const docText = await readFile(doc, 'utf8');
    expect(docText).toMatch(/# Agentic SDLC and Spec-Driven Development/);
    expect(docText).toContain('$kiro-spec-status');
    expect(docText).not.toContain('/prompts:kiro-spec-status');
    expect(docText).toContain('autonomous mode');

    const skillSpecInit = join(cwd, '.agents/skills/kiro-spec-init/SKILL.md');
    expect(await exists(skillSpecInit)).toBe(true);
    const skillSpecInitText = await readFile(skillSpecInit, 'utf8');
    expect(skillSpecInitText).toMatch(/name: kiro-spec-init/);
    expect(skillSpecInitText).toContain('$kiro-spec-requirements');

    const skillSpecQuick = join(cwd, '.agents/skills/kiro-spec-quick/SKILL.md');
    expect(await exists(skillSpecQuick)).toBe(true);
    const skillSpecQuickText = await readFile(skillSpecQuick, 'utf8');
    expect(skillSpecQuickText).toMatch(/name: kiro-spec-quick/);
    expect(skillSpecQuickText).toContain('$kiro-impl');

    const settingsTemplate = join(cwd, '.kiro/settings/templates/specs/init.json');
    expect(await exists(settingsTemplate)).toBe(true);

    const skillSpecDesign = join(cwd, '.agents/skills/kiro-spec-design/SKILL.md');
    expect(await exists(skillSpecDesign)).toBe(true);
    const skillSpecDesignText = await readFile(skillSpecDesign, 'utf8');
    expect(skillSpecDesignText).toContain('Parallel Research');
    expect(skillSpecDesignText).not.toMatch(/context: fork/);
    expect(skillSpecDesignText).toContain('Core steering context: `product.md`, `tech.md`, `structure.md`');
    expect(skillSpecDesignText).toContain('Step 5: Review Design Draft');
    expect(skillSpecDesignText).toContain('Keep the review bounded to at most 2 repair passes');
    expect(skillSpecDesignText).toContain('Spec Gap Found During Design Review');

    const skillValidateImpl = join(cwd, '.agents/skills/kiro-validate-impl/SKILL.md');
    expect(await exists(skillValidateImpl)).toBe(true);
    const skillValidateImplText = await readFile(skillValidateImpl, 'utf8');
    expect(skillValidateImplText).toContain('feature-level integration');
    expect(skillValidateImplText).toContain('Cross-Task Integration');
    expect(skillValidateImplText).toContain('Requirements Coverage Gaps');
    expect(skillValidateImplText).toContain('do NOT invent `REQ-*` aliases');
    expect(skillValidateImplText).toContain('Core steering context: `product.md`, `tech.md`, `structure.md`');
    expect(skillValidateImplText).toContain('MANUAL_VERIFY_REQUIRED');
    expect(skillValidateImplText).toContain('Does NOT Do');
    expect(skillValidateImplText).toContain('kiro-verify-completion');

    const skillImpl = join(cwd, '.agents/skills/kiro-impl/SKILL.md');
    expect(await exists(skillImpl)).toBe(true);
    const skillImplText = await readFile(skillImpl, 'utf8');
    expect(skillImplText).toContain('No Destructive Reset');
    expect(skillImplText).toContain('stop the feature run');
    expect(skillImplText).not.toContain('discard the failed implementation (`git checkout .`)');

    const skillValidateDesign = join(cwd, '.agents/skills/kiro-validate-design/SKILL.md');
    expect(await exists(skillValidateDesign)).toBe(true);
    const skillValidateDesignText = await readFile(skillValidateDesign, 'utf8');
    expect(skillValidateDesignText).toContain('Core steering context: `product.md`, `tech.md`, `structure.md`');
    expect(skillValidateDesignText).toContain('review-relevant steering or use-case-aligned local agent skills/playbooks');

    const skillValidateGap = join(cwd, '.agents/skills/kiro-validate-gap/SKILL.md');
    expect(await exists(skillValidateGap)).toBe(true);
    const skillValidateGapText = await readFile(skillValidateGap, 'utf8');
    expect(skillValidateGapText).toContain('Core steering context: `product.md`, `tech.md`, `structure.md`');
    expect(skillValidateGapText).toContain('analysis-relevant steering or use-case-aligned local agent skills/playbooks');

    const skillSpecRequirements = join(cwd, '.agents/skills/kiro-spec-requirements/SKILL.md');
    expect(await exists(skillSpecRequirements)).toBe(true);
    const skillSpecRequirementsText = await readFile(skillSpecRequirements, 'utf8');
    expect(skillSpecRequirementsText).toContain('Core steering context: `product.md`, `tech.md`, `structure.md`');
    expect(skillSpecRequirementsText).toContain('Additional steering files only when directly relevant');
    expect(skillSpecRequirementsText).toContain('Review Requirements Draft');
    expect(skillSpecRequirementsText).toContain('requirements review gate passes');
    expect(skillSpecRequirementsText).toContain('Scope Ambiguity Found During Requirements Review');
    // Shared rules resolved from templates/shared/settings/rules/
    const designRules = [
      'design-principles.md',
      'design-discovery-full.md',
      'design-discovery-light.md',
      'design-synthesis.md',
      'design-review-gate.md',
    ];
    for (const rule of designRules) {
      expect(await exists(join(cwd, `.agents/skills/kiro-spec-design/rules/${rule}`))).toBe(true);
    }
    expect(await exists(join(cwd, '.agents/skills/kiro-validate-design/rules/design-review.md'))).toBe(true);
    expect(await exists(join(cwd, '.agents/skills/kiro-spec-requirements/rules/ears-format.md'))).toBe(true);
    expect(await exists(join(cwd, '.agents/skills/kiro-spec-requirements/rules/requirements-review-gate.md'))).toBe(true);
    expect(await exists(join(cwd, '.agents/skills/kiro-validate-gap/rules/gap-analysis.md'))).toBe(true);
    expect(await exists(join(cwd, '.agents/skills/kiro-steering/rules/steering-principles.md'))).toBe(true);
    expect(await exists(join(cwd, '.agents/skills/kiro-steering-custom/rules/steering-principles.md'))).toBe(true);
    expect(await exists(join(cwd, '.agents/skills/kiro-spec-tasks/rules/tasks-generation.md'))).toBe(true);
    expect(await exists(join(cwd, '.agents/skills/kiro-spec-tasks/rules/tasks-parallel-analysis.md'))).toBe(true);
    const skillSpecTasks = join(cwd, '.agents/skills/kiro-spec-tasks/SKILL.md');
    const skillSpecTasksText = await readFile(skillSpecTasks, 'utf8');
    expect(skillSpecTasksText).toContain('Core steering context: `product.md`, `tech.md`, `structure.md`');
    expect(skillSpecTasksText).toContain('Step 3: Review Task Plan');
    expect(skillSpecTasksText).toContain('Keep the review bounded to at most 2 repair passes');
    expect(skillSpecTasksText).toContain('Spec Gap Found During Task Review');
    const tasksGenerationRules = await readFile(join(cwd, '.agents/skills/kiro-spec-tasks/rules/tasks-generation.md'), 'utf8');
    expect(tasksGenerationRules).toContain('## Task Plan Review Gate');
    expect(tasksGenerationRules).toContain('### Coverage Review');
    expect(tasksGenerationRules).toContain('### Executability Review');
    expect(tasksGenerationRules).toContain('no more than 2 review-and-repair passes');
    const designReviewGate = await readFile(join(cwd, '.agents/skills/kiro-spec-design/rules/design-review-gate.md'), 'utf8');
    expect(designReviewGate).toContain('## Requirements Coverage Review');
    expect(designReviewGate).toContain('## Architecture Readiness Review');
    expect(designReviewGate).toContain('## Executability Review');
    const requirementsReviewGate = await readFile(join(cwd, '.agents/skills/kiro-spec-requirements/rules/requirements-review-gate.md'), 'utf8');
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
      expect(await exists(join(cwd, `.agents/skills/${skill}/rules`))).toBe(false);
    }

    expect(ctx.logs.join('\n')).toMatch(/\d+\/\d+ files written/);
  });

  it('generates exactly 17 skill directories', async () => {
    const cwd = await mkTmp();
    const ctx = makeIO();
    await runCli(
      ['--lang', 'en', '--agent', 'codex-skills', '--manifest', manifestPath, '--overwrite=force'],
      runtime,
      ctx.io,
      {},
      { cwd, templatesRoot: process.cwd() },
    );

    const expectedSkills = [
      'kiro-debug',
      'kiro-discovery',
      'kiro-review',
      'kiro-spec-batch',
      'kiro-spec-init',
      'kiro-spec-quick',
      'kiro-spec-requirements',
      'kiro-spec-design',
      'kiro-spec-tasks',
      'kiro-impl',
      'kiro-spec-status',
      'kiro-steering',
      'kiro-steering-custom',
      'kiro-validate-gap',
      'kiro-validate-design',
      'kiro-validate-impl',
      'kiro-verify-completion',
    ];

    for (const skill of expectedSkills) {
      const skillPath = join(cwd, `.agents/skills/${skill}/SKILL.md`);
      expect(await exists(skillPath)).toBe(true);
    }

    // kiro-impl has prompt templates
    const implPrompt = join(cwd, '.agents/skills/kiro-impl/templates/implementer-prompt.md');
    expect(await exists(implPrompt)).toBe(true);
    const implPromptText = await readFile(implPrompt, 'utf8');
    expect(implPromptText).toContain('TDD');
    expect(implPromptText).toContain('STATUS: READY_FOR_REVIEW');
    expect(implPromptText).toContain('Do NOT update `tasks.md`');
    expect(implPromptText).toContain('The parent controller parses the exact `- STATUS:` line');

    const reviewPrompt = join(cwd, '.agents/skills/kiro-impl/templates/reviewer-prompt.md');
    expect(await exists(reviewPrompt)).toBe(true);
    const reviewPromptText = await readFile(reviewPrompt, 'utf8');
    expect(reviewPromptText).toContain('Apply the `kiro-review` protocol');
    expect(reviewPromptText).toContain('Reality Check');
    expect(reviewPromptText).toContain('Do Not Trust the Report');
    expect(reviewPromptText).toContain('mechanical checks');
    expect(reviewPromptText).toContain('The parent controller parses the exact `- VERDICT:` line');

    const debugPrompt = join(cwd, '.agents/skills/kiro-impl/templates/debugger-prompt.md');
    expect(await exists(debugPrompt)).toBe(true);
    const debugPromptText = await readFile(debugPrompt, 'utf8');
    expect(debugPromptText).toContain('Apply the `kiro-debug` protocol');
    expect(debugPromptText).toContain('web or official docs research');
    expect(debugPromptText).toContain('repo-fixability judgment');

    const skillReview = join(cwd, '.agents/skills/kiro-review/SKILL.md');
    expect(await exists(skillReview)).toBe(true);
    const skillReviewText = await readFile(skillReview, 'utf8');
    expect(skillReviewText).toContain('task-local adversarial review');
    expect(skillReviewText).toContain('RED phase');
    expect(skillReviewText).toContain('MECHANICAL_RESULTS');

    const skillDebug = join(cwd, '.agents/skills/kiro-debug/SKILL.md');
    expect(await exists(skillDebug)).toBe(true);
    const skillDebugText = await readFile(skillDebug, 'utf8');
    expect(skillDebugText).toContain('root cause investigation');
    expect(skillDebugText).toContain('Search the Web if Available');
    expect(skillDebugText).toContain('NEXT_ACTION: RETRY_TASK | BLOCK_TASK | STOP_FOR_HUMAN');
    expect(skillDebugText).toContain('TASK_ORDERING_PROBLEM');

    const skillVerifyCompletion = join(cwd, '.agents/skills/kiro-verify-completion/SKILL.md');
    expect(await exists(skillVerifyCompletion)).toBe(true);
    const skillVerifyCompletionText = await readFile(skillVerifyCompletion, 'utf8');
    expect(skillVerifyCompletionText).toContain('fresh evidence');
    expect(skillVerifyCompletionText).toContain('FEATURE_GO');
    expect(skillVerifyCompletionText).toContain('MANUAL_VERIFY_REQUIRED');

    // every skill has agents/openai.yaml
    for (const skill of expectedSkills) {
      const yamlPath = join(cwd, `.agents/skills/${skill}/agents/openai.yaml`);
      expect(await exists(yamlPath)).toBe(true);
    }
  });
});
