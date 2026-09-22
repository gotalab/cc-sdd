import { afterEach, describe, expect, it } from 'vitest';
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runCli } from '../src/index';

const runtime = { platform: 'darwin' } as const;
const directories: string[] = [];
const skills = [
  'kiro-debug', 'kiro-discovery', 'kiro-impl', 'kiro-review', 'kiro-spec-batch',
  'kiro-spec-design', 'kiro-spec-init', 'kiro-spec-quick', 'kiro-spec-requirements',
  'kiro-spec-status', 'kiro-spec-tasks', 'kiro-steering', 'kiro-steering-custom',
  'kiro-validate-design', 'kiro-validate-gap', 'kiro-validate-impl', 'kiro-verify-completion',
];

const makeProject = async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'ccsdd-devin-skills-'));
  directories.push(cwd);
  return cwd;
};

const install = async (cwd: string, args: string[]) => {
  const logs: string[] = [];
  const errors: string[] = [];
  const code = await runCli(
    args,
    runtime,
    { log: (value) => logs.push(value), error: (value) => errors.push(value), exit: () => {} },
    {},
    { cwd, templatesRoot: process.cwd() },
  );
  expect(errors).toEqual([]);
  expect(code).toBe(0);
  return logs.join('\n');
};

afterEach(async () => {
  await Promise.all(directories.splice(0).map((cwd) => rm(cwd, { recursive: true, force: true })));
});

describe('real Devin skills manifest', () => {
  it.each(['--devin', '--devin-skills'])('%s plans the native destination without writing files', async (flag) => {
    const cwd = await makeProject();
    const output = await install(cwd, [flag, '--dry-run']);
    expect(output).toContain('templates/agents/devin-skills/skills -> .devin/skills');
    expect(output).toContain('templates/agents/devin-skills/docs/AGENTS.md -> ./AGENTS.md');
    expect(await readdir(cwd)).toEqual([]);
  });

  it.each(['en', 'ja'])('installs all skills and their supporting files in %s', async (lang) => {
    const cwd = await makeProject();
    const output = await install(cwd, ['--agent', 'devin-skills', '--lang', lang, '--overwrite=force']);
    const skillRoot = join(cwd, '.devin/skills');
    expect((await readdir(skillRoot)).sort()).toEqual([...skills].sort());
    for (const skill of skills) {
      const content = await readFile(join(skillRoot, skill, 'SKILL.md'), 'utf8');
      expect(content).toContain(`name: ${skill}`);
      expect(content).not.toMatch(/\{\{(?:KIRO_DIR|AGENT_[A-Z_]+|DEV_GUIDELINES)\}\}/);
      expect(content).not.toContain('.opencode/skills');
      expect(content).not.toContain('@kiro-');
    }
    for (const resource of [
      'kiro-impl/templates/implementer-prompt.md',
      'kiro-impl/templates/reviewer-prompt.md',
      'kiro-impl/templates/debugger-prompt.md',
      'kiro-spec-design/rules/design-review-gate.md',
      'kiro-spec-requirements/rules/requirements-review-gate.md',
      'kiro-spec-tasks/rules/tasks-generation.md',
    ]) {
      expect((await readFile(join(skillRoot, resource), 'utf8')).length).toBeGreaterThan(0);
    }
    const init = JSON.parse(await readFile(join(cwd, '.kiro/settings/templates/specs/init.json'), 'utf8'));
    expect(init.language).toBe(lang);
    const quickstart = await readFile(join(cwd, 'AGENTS.md'), 'utf8');
    expect(quickstart).toContain('.devin/skills');
    expect(quickstart).toContain('/kiro-spec-status');
    expect(quickstart).toContain(lang === 'ja' ? 'generate responses in Japanese' : 'generate responses in English');
    expect(output).not.toContain('DEPRECATED:');
  });

  it('preserves legacy skills, specs, and customized instructions when conflicts are skipped', async () => {
    const cwd = await makeProject();
    const legacy = join(cwd, '.windsurf/skills/kiro-spec-init/SKILL.md');
    const spec = join(cwd, '.kiro/specs/existing/spec.json');
    await mkdir(join(cwd, '.windsurf/skills/kiro-spec-init'), { recursive: true });
    await mkdir(join(cwd, '.kiro/specs/existing'), { recursive: true });
    await writeFile(legacy, 'custom Cascade skill\n');
    await writeFile(spec, '{"phase":"tasks-approved"}\n');
    await writeFile(join(cwd, 'AGENTS.md'), 'custom project instructions\n');

    await install(cwd, ['--devin', '--overwrite=skip']);

    expect(await readFile(legacy, 'utf8')).toBe('custom Cascade skill\n');
    expect(await readFile(spec, 'utf8')).toBe('{"phase":"tasks-approved"}\n');
    expect(await readFile(join(cwd, 'AGENTS.md'), 'utf8')).toBe('custom project instructions\n');
    expect(await readFile(join(cwd, '.devin/skills/kiro-spec-init/SKILL.md'), 'utf8')).toContain('name: kiro-spec-init');
  });
});
