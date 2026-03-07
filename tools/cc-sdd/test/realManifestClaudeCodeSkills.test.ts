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
    expect(out).toContain('[templateDir] agents_library: templates/agents/claude-code-skills/agents -> .claude/agents');
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
    expect(text).toContain('implements all tasks and runs final validation');

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
    expect(skillValidateImplText).not.toMatch(/context: fork/);
    expect(skillValidateImplText).toContain('Parallel Research');
    expect(skillValidateImplText).toContain('Implementation integrity');
    expect(skillValidateImplText).toContain('do not invent `REQ-*` aliases');
    expect(skillValidateImplText).toContain('Core steering context: `product.md`, `tech.md`, `structure.md`');
    expect(skillValidateImplText).toContain('validation-relevant steering or use-case-aligned local agent skills/playbooks');

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
    expect(skillSpecRequirementsText).toContain('requirement-relevant steering or use-case-aligned local agent skills/playbooks');
    const skillRalphImpl = join(cwd, '.claude/skills/kiro-ralph-impl/SKILL.md');
    expect(await exists(skillRalphImpl)).toBe(true);
    const skillRalphImplText = await readFile(skillRalphImpl, 'utf8');
    expect(skillRalphImplText).toMatch(/name: kiro-ralph-impl/);
    expect(skillRalphImplText).toContain('Ralph Loop');
    expect(skillRalphImplText).toContain('Otherwise: `100`');
    expect(skillRalphImplText).toContain('default of 100');
    expect(skillRalphImplText).toContain('Preflight: Verify Ralph Loop plugin is installed');
    expect(skillRalphImplText).toContain('Hard stop');
    expect(skillRalphImplText).toContain('Do not create `.claude/ralph-loop.local.md`');
    expect(skillRalphImplText).toContain('Final Validation Required');
    expect(skillRalphImplText).toContain('final-validation-only mode');

    const ralphPrompt = join(cwd, '.claude/skills/kiro-ralph-impl/templates/ralph-prompt.md');
    expect(await exists(ralphPrompt)).toBe(true);
    const ralphPromptText = await readFile(ralphPrompt, 'utf8');
    expect(ralphPromptText).toContain('Parent Responsibilities');
    expect(ralphPromptText).toContain('all required sub-tasks');
    expect(ralphPromptText).toContain('max_iterations` defaults to 100');
    expect(ralphPromptText).toContain('Subagent does NOT update `tasks.md` or create commits');
    expect(ralphPromptText).toContain('does not invent `REQ-*` aliases');
    expect(ralphPromptText).toContain('mock/stub/placeholder/fake/TODO-only path');
    expect(ralphPromptText).toContain('Final validation and remediation');
    expect(ralphPromptText).toContain('kiro-validate-impl');
    expect(ralphPromptText).toContain('Core steering context: `product.md`, `tech.md`, `structure.md`');
    expect(ralphPromptText).toContain('Relevant local agent skills or playbooks only when they clearly match');

    const ralphSubagent = join(cwd, '.claude/agents/tdd-task-implementer.md');
    expect(await exists(ralphSubagent)).toBe(true);
    const ralphSubagentText = await readFile(ralphSubagent, 'utf8');
    expect(ralphSubagentText).toContain('Do NOT update `tasks.md`');
    expect(ralphSubagentText).toContain('Do NOT create commits');
    expect(ralphSubagentText).toContain('name: tdd-task-implementer');
    expect(ralphSubagentText).toContain('do NOT invent `REQ-*` aliases');
    expect(ralphSubagentText).toContain('Review and Fix Loop');

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

    // Skills without shared-rules should NOT have rules/ directories
    const noRulesSkills = ['kiro-spec-init', 'kiro-spec-status', 'kiro-spec-quick', 'kiro-spec-impl', 'kiro-ralph-impl', 'kiro-validate-impl'];
    for (const skill of noRulesSkills) {
      expect(await exists(join(cwd, `.claude/skills/${skill}/rules`))).toBe(false);
    }

    const settingsRuleDir = join(cwd, '.kiro/settings/rules');
    expect(await exists(settingsRuleDir)).toBe(false);

    expect(ctx.logs.join('\n')).toMatch(/Setup completed: written=\d+, skipped=\d+/);
  });

  it('generates exactly 13 skill directories', async () => {
    const cwd = await mkTmp();
    const ctx = makeIO();
    await runCli(['--lang', 'en', '--manifest', manifestPath, '--overwrite=force', '--claude-skills'], runtime, ctx.io, {}, { cwd, templatesRoot: process.cwd() });

    const expectedSkills = [
      'kiro-spec-init',
      'kiro-spec-status',
      'kiro-spec-quick',
      'kiro-spec-design',
      'kiro-spec-requirements',
      'kiro-spec-tasks',
      'kiro-spec-impl',
      'kiro-ralph-impl',
      'kiro-steering',
      'kiro-steering-custom',
      'kiro-validate-design',
      'kiro-validate-gap',
      'kiro-validate-impl',
    ];

    for (const skill of expectedSkills) {
      const skillPath = join(cwd, `.claude/skills/${skill}/SKILL.md`);
      expect(await exists(skillPath)).toBe(true);
    }

    expect(await exists(join(cwd, '.claude/agents/tdd-task-implementer.md'))).toBe(true);
  });
});
