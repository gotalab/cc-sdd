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
      ['--dry-run', '--lang', 'en', '--codex-skills', '--manifest', manifestPath],
      runtime,
      ctx.io,
      {},
    );
    expect(code).toBe(0);
    const out = ctx.logs.join('\n');
    expect(out).toMatch(/Plan \(dry-run\)/);
    expect(out).toContain('[templateDir] skills_library: templates/agents/codex-skills/skills -> .codex/skills');
    expect(out).not.toContain('commands: templates/agents/codex/commands -> .codex/prompts');
    expect(out).not.toContain('doc_main: templates/agents/codex/docs/AGENTS.md -> ./AGENTS.md');
    expect(out).not.toContain('settings_common: templates/shared/settings -> .kiro/settings');
  });

  it('apply writes only skills to cwd', async () => {
    const cwd = await mkTmp();
    const ctx = makeIO();
    const code = await runCli(
      ['--lang', 'en', '--codex-skills', '--manifest', manifestPath, '--overwrite=force'],
      runtime,
      ctx.io,
      {},
      { cwd, templatesRoot: process.cwd() },
    );
    expect(code).toBe(0);

    const skillFile = join(cwd, '.codex/skills/kiro-spec-init/SKILL.md');
    expect(await exists(skillFile)).toBe(true);
    const skillText = await readFile(skillFile, 'utf8');
    expect(skillText).toMatch(/^---\nname: kiro-spec-init/m);
    expect(skillText).toContain('description: Initialize a new specification with detailed project description');

    const commandFile = join(cwd, '.codex/prompts/kiro-spec-init.md');
    expect(await exists(commandFile)).toBe(false);

    const doc = join(cwd, 'AGENTS.md');
    expect(await exists(doc)).toBe(false);

    const settingsTemplate = join(cwd, '.kiro/settings/templates/specs/init.json');
    expect(await exists(settingsTemplate)).toBe(false);

    expect(ctx.logs.join('\n')).toMatch(/Setup completed: written=\d+, skipped=\d+/);
  });
});
