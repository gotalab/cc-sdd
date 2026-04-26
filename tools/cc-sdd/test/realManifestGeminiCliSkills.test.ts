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

const mkTmp = async () => mkdtemp(join(tmpdir(), 'ccsdd-real-manifest-gemini-cli-skills-'));
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
const manifestPath = join(repoRoot, 'tools/cc-sdd/templates/manifests/gemini-cli-skills.json');

describe('real gemini-cli-skills manifest', () => {
  it('dry-run prints plan for gemini-cli-skills.json with placeholders applied', async () => {
    const ctx = makeIO();
    const code = await runCli(
      ['--dry-run', '--lang', 'en', '--agent', 'gemini-cli-skills', '--manifest', manifestPath],
      runtime,
      ctx.io,
      {},
    );
    expect(code).toBe(0);
    const out = ctx.logs.join('\n');
    expect(out).toMatch(/Plan \(dry-run\)/);
    expect(out).toContain('[templateDir] skills: templates/agents/gemini-cli-skills/skills -> .gemini/skills');
    expect(out).toContain('[templateFile] doc_main: templates/agents/gemini-cli-skills/docs/GEMINI.md -> ./GEMINI.md');
    expect(out).toContain('[templateDir] settings_templates: templates/shared/settings/templates -> .kiro/settings/templates');
    expect(out).toContain('[templateDir] gemini_agents');
  });

  it('apply writes GEMINI.md, skill files, and settings to cwd', async () => {
    const cwd = await mkTmp();
    const ctx = makeIO();
    const code = await runCli(
      ['--lang', 'en', '--agent', 'gemini-cli-skills', '--manifest', manifestPath, '--overwrite=force'],
      runtime,
      ctx.io,
      {},
      { cwd, templatesRoot: process.cwd() },
    );
    expect(code).toBe(0);

    const doc = join(cwd, 'GEMINI.md');
    expect(await exists(doc)).toBe(true);
    const docText = await readFile(doc, 'utf8');
    expect(docText).toMatch(/# Agentic SDLC and Spec-Driven Development/);
    expect(docText).toContain('/kiro-spec-status');
    expect(docText).not.toContain('$kiro-spec-status');
    expect(docText).toContain('autonomous mode');
    expect(docText).toContain('[--review required|inline|off]');
    expect(docText).toContain('`--review off` skips task-local review');

    const skillSpecInit = join(cwd, '.gemini/skills/kiro-spec-init/SKILL.md');
    expect(await exists(skillSpecInit)).toBe(true);
    const skillSpecInitText = await readFile(skillSpecInit, 'utf8');
    expect(skillSpecInitText).toMatch(/name: kiro-spec-init/);
    expect(skillSpecInitText).toContain('/kiro-spec-requirements');

    const skillSpecQuick = join(cwd, '.gemini/skills/kiro-spec-quick/SKILL.md');
    expect(await exists(skillSpecQuick)).toBe(true);
    const skillSpecQuickText = await readFile(skillSpecQuick, 'utf8');
    expect(skillSpecQuickText).toMatch(/name: kiro-spec-quick/);
    expect(skillSpecQuickText).toContain('/kiro-impl');

    const settingsTemplate = join(cwd, '.kiro/settings/templates/specs/init.json');
    expect(await exists(settingsTemplate)).toBe(true);

    // Gemini-specific: agents directory
    const geminiAgent = join(cwd, '.gemini/agents/spec-reviewer.md');
    expect(await exists(geminiAgent)).toBe(true);
    const geminiAgentText = await readFile(geminiAgent, 'utf8');
    expect(geminiAgentText).toMatch(/^---\nname: spec-reviewer\n/);
    expect(geminiAgentText).toContain('tools:\n  - read_file\n  - glob\n');
    expect(geminiAgentText).toContain('Use `glob` to find all spec files');
    expect(geminiAgentText).toContain('Use `read_file` to read each file found');

    const skillSpecDesign = join(cwd, '.gemini/skills/kiro-spec-design/SKILL.md');
    expect(await exists(skillSpecDesign)).toBe(true);
    const skillSpecDesignText = await readFile(skillSpecDesign, 'utf8');
    expect(skillSpecDesignText).toContain('Parallel Research');
    expect(skillSpecDesignText).not.toMatch(/context: fork/);
    expect(skillSpecDesignText).toContain('Core steering context: `product.md`, `tech.md`, `structure.md`');
    expect(skillSpecDesignText).toContain('Step 5: Review Design Draft');
    expect(skillSpecDesignText).toContain('Keep the review bounded to at most 2 repair passes');
    expect(skillSpecDesignText).toContain('Spec Gap Found During Design Review');

    const skillValidateImpl = join(cwd, '.gemini/skills/kiro-validate-impl/SKILL.md');
    expect(await exists(skillValidateImpl)).toBe(true);
    const skillValidateImplText = await readFile(skillValidateImpl, 'utf8');
    expect(skillValidateImplText).toContain('feature-level integration');
    expect(skillValidateImplText).toContain('Cross-Task Integration');
    expect(skillValidateImplText).toContain('Requirements Coverage Gaps');
    expect(skillValidateImplText).toContain('do NOT invent `REQ-*` aliases');
    expect(skillValidateImplText).toContain('Core steering context: `product.md`, `tech.md`, `structure.md`');
    expect(skillValidateImplText).toContain('MANUAL_VERIFY_REQUIRED');
    expect(skillValidateImplText).toContain('Does NOT Do');
    expect(skillValidateImplText).toContain('usually reviewed during implementation');
    expect(skillValidateImplText).toContain('`--review off`');

    const skillImpl = join(cwd, '.gemini/skills/kiro-impl/SKILL.md');
    expect(await exists(skillImpl)).toBe(true);
    const skillImplText = await readFile(skillImpl, 'utf8');
    expect(skillImplText).toContain('Default is `required`');
    expect(skillImplText).toContain('`--review required|inline|off`');
    expect(skillImplText).toContain('skip review');
    expect(skillImplText).toContain('If review mode is `off`');

    const skillValidateDesign = join(cwd, '.gemini/skills/kiro-validate-design/SKILL.md');
    expect(await exists(skillValidateDesign)).toBe(true);
    const skillValidateDesignText = await readFile(skillValidateDesign, 'utf8');
    expect(skillValidateDesignText).toContain('Core steering context: `product.md`, `tech.md`, `structure.md`');
    expect(skillValidateDesignText).toContain('review-relevant steering or use-case-aligned local agent skills/playbooks');

    const skillValidateGap = join(cwd, '.gemini/skills/kiro-validate-gap/SKILL.md');
    expect(await exists(skillValidateGap)).toBe(true);
    const skillValidateGapText = await readFile(skillValidateGap, 'utf8');
    expect(skillValidateGapText).toContain('Core steering context: `product.md`, `tech.md`, `structure.md`');
    expect(skillValidateGapText).toContain('analysis-relevant steering or use-case-aligned local agent skills/playbooks');

    const skillSpecRequirements = join(cwd, '.gemini/skills/kiro-spec-requirements/SKILL.md');
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
      expect(await exists(join(cwd, `.gemini/skills/kiro-spec-design/rules/${rule}`))).toBe(true);
    }
    expect(await exists(join(cwd, '.gemini/skills/kiro-validate-design/rules/design-review.md'))).toBe(true);
    expect(await exists(join(cwd, '.gemini/skills/kiro-spec-requirements/rules/ears-format.md'))).toBe(true);
    expect(await exists(join(cwd, '.gemini/skills/kiro-spec-requirements/rules/requirements-review-gate.md'))).toBe(true);
    expect(await exists(join(cwd, '.gemini/skills/kiro-validate-gap/rules/gap-analysis.md'))).toBe(true);
    expect(await exists(join(cwd, '.gemini/skills/kiro-steering/rules/steering-principles.md'))).toBe(true);
    expect(await exists(join(cwd, '.gemini/skills/kiro-steering-custom/rules/steering-principles.md'))).toBe(true);
    expect(await exists(join(cwd, '.gemini/skills/kiro-spec-tasks/rules/tasks-generation.md'))).toBe(true);
    expect(await exists(join(cwd, '.gemini/skills/kiro-spec-tasks/rules/tasks-parallel-analysis.md'))).toBe(true);
    const skillSpecTasks = join(cwd, '.gemini/skills/kiro-spec-tasks/SKILL.md');
    const skillSpecTasksText = await readFile(skillSpecTasks, 'utf8');
    expect(skillSpecTasksText).toContain('Core steering context: `product.md`, `tech.md`, `structure.md`');
    expect(skillSpecTasksText).toContain('Step 3: Review Task Plan');
    expect(skillSpecTasksText).toContain('Keep the review bounded to at most 2 repair passes');
    expect(skillSpecTasksText).toContain('Spec Gap Found During Task Review');
    const tasksGenerationRules = await readFile(join(cwd, '.gemini/skills/kiro-spec-tasks/rules/tasks-generation.md'), 'utf8');
    expect(tasksGenerationRules).toContain('## Task Plan Review Gate');
    expect(tasksGenerationRules).toContain('### Coverage Review');
    expect(tasksGenerationRules).toContain('### Executability Review');
    expect(tasksGenerationRules).toContain('no more than 2 review-and-repair passes');
    const designReviewGate = await readFile(join(cwd, '.gemini/skills/kiro-spec-design/rules/design-review-gate.md'), 'utf8');
    expect(designReviewGate).toContain('## Requirements Coverage Review');
    expect(designReviewGate).toContain('## Architecture Readiness Review');
    expect(designReviewGate).toContain('## Executability Review');
    const requirementsReviewGate = await readFile(join(cwd, '.gemini/skills/kiro-spec-requirements/rules/requirements-review-gate.md'), 'utf8');
    expect(requirementsReviewGate).toContain('## Scope and Coverage Review');
    expect(requirementsReviewGate).toContain('## EARS and Testability Review');
    expect(requirementsReviewGate).toContain('## Structure and Quality Review');

    // Skills without shared-rules should NOT have rules/ directories
    const noRulesSkills = ['kiro-spec-init', 'kiro-spec-status', 'kiro-spec-quick', 'kiro-spec-batch', 'kiro-impl', 'kiro-validate-impl', 'kiro-discovery'];
    for (const skill of noRulesSkills) {
      expect(await exists(join(cwd, `.gemini/skills/${skill}/rules`))).toBe(false);
    }

    expect(ctx.logs.join('\n')).toMatch(/\d+\/\d+ files written/);
  });

  it('generates exactly 17 skill directories', async () => {
    const cwd = await mkTmp();
    const ctx = makeIO();
    await runCli(
      ['--lang', 'en', '--agent', 'gemini-cli-skills', '--manifest', manifestPath, '--overwrite=force'],
      runtime,
      ctx.io,
      {},
      { cwd, templatesRoot: process.cwd() },
    );

    const expectedSkills = [
      'kiro-discovery',
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
      'kiro-review',
      'kiro-debug',
      'kiro-verify-completion',
    ];

    for (const skill of expectedSkills) {
      const skillPath = join(cwd, `.gemini/skills/${skill}/SKILL.md`);
      expect(await exists(skillPath)).toBe(true);
    }

    // kiro-impl has prompt templates
    const implPrompt = join(cwd, '.gemini/skills/kiro-impl/templates/implementer-prompt.md');
    expect(await exists(implPrompt)).toBe(true);
    const implPromptText = await readFile(implPrompt, 'utf8');
    expect(implPromptText).toContain('TDD');
    expect(implPromptText).toContain('STATUS: READY_FOR_REVIEW');
    expect(implPromptText).toContain('Do NOT update `tasks.md`');
    expect(implPromptText).toContain('The parent controller parses the exact `- STATUS:` line');

    const reviewPrompt = join(cwd, '.gemini/skills/kiro-impl/templates/reviewer-prompt.md');
    expect(await exists(reviewPrompt)).toBe(true);
    const reviewPromptText = await readFile(reviewPrompt, 'utf8');
    expect(reviewPromptText).toContain('Apply the `kiro-review` protocol');
    expect(reviewPromptText).toContain('Reality Check');
    expect(reviewPromptText).toContain('Do Not Trust the Report');
    expect(reviewPromptText).toContain('The parent controller parses the exact `- VERDICT:` line');
  });
});
