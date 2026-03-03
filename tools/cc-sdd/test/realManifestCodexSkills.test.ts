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
    expect(docText).toMatch(/# AI-DLC and Spec-Driven Development/);
    expect(docText).toContain('$kiro-spec-status');
    expect(docText).not.toContain('/prompts:kiro-spec-status');

    const skillSpecInit = join(cwd, '.agents/skills/kiro-spec-init/SKILL.md');
    expect(await exists(skillSpecInit)).toBe(true);
    const skillSpecInitText = await readFile(skillSpecInit, 'utf8');
    expect(skillSpecInitText).toMatch(/name: kiro-spec-init/);
    expect(skillSpecInitText).toContain('$kiro-spec-requirements');

    const skillSpecQuick = join(cwd, '.agents/skills/kiro-spec-quick/SKILL.md');
    expect(await exists(skillSpecQuick)).toBe(true);
    const skillSpecQuickText = await readFile(skillSpecQuick, 'utf8');
    expect(skillSpecQuickText).toMatch(/name: kiro-spec-quick/);
    expect(skillSpecQuickText).toContain('$kiro-spec-impl');

    const settingsTemplate = join(cwd, '.kiro/settings/templates/specs/init.json');
    expect(await exists(settingsTemplate)).toBe(true);

    const skillSpecDesign = join(cwd, '.agents/skills/kiro-spec-design/SKILL.md');
    expect(await exists(skillSpecDesign)).toBe(true);
    const skillSpecDesignText = await readFile(skillSpecDesign, 'utf8');
    expect(skillSpecDesignText).toContain('Parallel Research');
    expect(skillSpecDesignText).not.toMatch(/context: fork/);

    // Shared rules resolved from templates/shared/settings/rules/
    const designRules = [
      'design-principles.md',
      'design-discovery-full.md',
      'design-discovery-light.md',
      'design-synthesis.md',
    ];
    for (const rule of designRules) {
      expect(await exists(join(cwd, `.agents/skills/kiro-spec-design/rules/${rule}`))).toBe(true);
    }
    expect(await exists(join(cwd, '.agents/skills/kiro-validate-design/rules/design-review.md'))).toBe(true);
    expect(await exists(join(cwd, '.agents/skills/kiro-spec-requirements/rules/ears-format.md'))).toBe(true);
    expect(await exists(join(cwd, '.agents/skills/kiro-validate-gap/rules/gap-analysis.md'))).toBe(true);
    expect(await exists(join(cwd, '.agents/skills/kiro-steering/rules/steering-principles.md'))).toBe(true);
    expect(await exists(join(cwd, '.agents/skills/kiro-steering-custom/rules/steering-principles.md'))).toBe(true);
    expect(await exists(join(cwd, '.agents/skills/kiro-spec-tasks/rules/tasks-generation.md'))).toBe(true);
    expect(await exists(join(cwd, '.agents/skills/kiro-spec-tasks/rules/tasks-parallel-analysis.md'))).toBe(true);

    // Skills without shared-rules should NOT have rules/ directories
    const noRulesSkills = ['kiro-spec-init', 'kiro-spec-status', 'kiro-spec-quick', 'kiro-spec-impl', 'kiro-ralph-impl', 'kiro-validate-impl'];
    for (const skill of noRulesSkills) {
      expect(await exists(join(cwd, `.agents/skills/${skill}/rules`))).toBe(false);
    }

    expect(ctx.logs.join('\n')).toMatch(/Setup completed: written=\d+, skipped=\d+/);
  });

  it('generates exactly 13 skill directories', async () => {
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
      'kiro-spec-init',
      'kiro-spec-quick',
      'kiro-spec-requirements',
      'kiro-spec-design',
      'kiro-spec-tasks',
      'kiro-spec-impl',
      'kiro-spec-status',
      'kiro-steering',
      'kiro-steering-custom',
      'kiro-validate-gap',
      'kiro-validate-design',
      'kiro-validate-impl',
      'kiro-ralph-impl',
    ];

    for (const skill of expectedSkills) {
      const skillPath = join(cwd, `.agents/skills/${skill}/SKILL.md`);
      expect(await exists(skillPath)).toBe(true);
    }

    // kiro-ralph-impl has a templates subdirectory with ralph-prompt.md
    const ralphPrompt = join(cwd, '.agents/skills/kiro-ralph-impl/templates/ralph-prompt.md');
    expect(await exists(ralphPrompt)).toBe(true);

    // kiro-ralph-impl has scripts directory with loop management scripts
    const scriptsDir = join(cwd, '.agents/skills/kiro-ralph-impl/scripts');
    for (const script of ['setup-loop.sh', 'check-loop.sh', 'next-task.sh', 'complete-task.sh']) {
      expect(await exists(join(scriptsDir, script))).toBe(true);
    }

    // every skill has agents/openai.yaml
    for (const skill of expectedSkills) {
      const yamlPath = join(cwd, `.agents/skills/${skill}/agents/openai.yaml`);
      expect(await exists(yamlPath)).toBe(true);
    }
  });
});
