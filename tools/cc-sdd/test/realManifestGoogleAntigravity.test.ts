import { describe, it, expect } from 'vitest';
import { runCli } from '../src/index';
import { mkdtemp, readFile, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const makeIO = () => {
  const logs: string[] = [];
  const errs: string[] = [];
  return {
    io: {
      log: (m: string) => logs.push(m),
      error: (m: string) => errs.push(m),
      exit: (_c: number) => {},
    },
    get logs() { return logs; },
    get errs() { return errs; },
  };
};

const mkTmp = async () => mkdtemp(join(tmpdir(), 'ccsdd-real-manifest-antigravity-'));
const exists = async (p: string) => { try { await stat(p); return true; } catch { return false; } };

// vitest runs in tools/cc-sdd; repoRoot is two levels up
const repoRoot = join(process.cwd(), '..', '..');
const manifestPath = join(repoRoot, 'tools/cc-sdd/templates/manifests/google-antigravity.json');

describe('real google-antigravity manifest (mac)', () => {
  const runtimeDarwin = { platform: 'darwin' } as const;

  it('dry-run prints plan for google-antigravity.json with placeholders applied', async () => {
    const ctx = makeIO();
    const code = await runCli(['--dry-run', '--lang', 'en', '--agent', 'google-antigravity', '--manifest', manifestPath], runtimeDarwin, ctx.io, {});
    expect(code).toBe(0);
    const out = ctx.logs.join('\\n');
    expect(out).toMatch(/Plan \(dry-run\)/);
    expect(out).toContain('[templateDir] commands: templates/agents/google-antigravity/workflows -> .agent/workflows');
    expect(out).toContain('[templateDir] skills: templates/agents/google-antigravity/skills -> .agent/skills');
    expect(out).toContain('[templateFile] doc_main: templates/agents/google-antigravity/docs/GEMINI.md -> ./GEMINI.md');
    expect(out).toContain('[templateDir] settings_common: templates/shared/settings -> .kiro/settings');
  });

  it('apply writes GEMINI.md and command files to cwd', async () => {
    const cwd = await mkTmp();
    const ctx = makeIO();
    const code = await runCli(['--lang', 'en', '--agent', 'google-antigravity', '--manifest', manifestPath, '--overwrite=force'], runtimeDarwin, ctx.io, {}, { cwd, templatesRoot: process.cwd() });
    expect(code).toBe(0);

    const doc = join(cwd, 'GEMINI.md');
    expect(await exists(doc)).toBe(true);
    const text = await readFile(doc, 'utf8');
    expect(text).toMatch(/# AI-DLC and Spec-Driven Development/);

    const cmd = join(cwd, '.agent/workflows/kiro-spec-init.md');
    expect(await exists(cmd)).toBe(true);

    const skill = join(cwd, '.agent/skills/kiro-sdd/SKILL.md');
    expect(await exists(skill)).toBe(true);

    const settingsRule = join(cwd, '.kiro/settings/rules/design-principles.md');
    expect(await exists(settingsRule)).toBe(true);

    expect(ctx.logs.join('\\n')).toMatch(/Setup completed: written=\d+, skipped=\d+/);
  });
});

describe('real google-antigravity manifest (linux)', () => {
  const runtimeLinux = { platform: 'linux' } as const;

  it('dry-run prints plan including commands for linux', async () => {
    const ctx = makeIO();
    const code = await runCli(['--dry-run', '--lang', 'en', '--agent', 'google-antigravity', '--manifest', manifestPath], runtimeLinux, ctx.io, {});
    expect(code).toBe(0);
    const out = ctx.logs.join('\\n');
    expect(out).toMatch(/Plan \(dry-run\)/);
    expect(out).toContain('[templateDir] commands: templates/agents/google-antigravity/workflows -> .agent/workflows');
    expect(out).toContain('[templateDir] skills: templates/agents/google-antigravity/skills -> .agent/skills');
    expect(out).toContain('[templateFile] doc_main: templates/agents/google-antigravity/docs/GEMINI.md -> ./GEMINI.md');
    expect(out).toContain('[templateDir] settings_common: templates/shared/settings -> .kiro/settings');
  });

  it('apply writes GEMINI.md and command files to cwd on linux', async () => {
    const cwd = await mkTmp();
    const ctx = makeIO();
    const code = await runCli(['--lang', 'en', '--agent', 'google-antigravity', '--manifest', manifestPath, '--overwrite=force'], runtimeLinux, ctx.io, {}, { cwd, templatesRoot: process.cwd() });
    expect(code).toBe(0);

    const doc = join(cwd, 'GEMINI.md');
    expect(await exists(doc)).toBe(true);
    const text = await readFile(doc, 'utf8');
    expect(text).toMatch(/# AI-DLC and Spec-Driven Development/);

    const cmd = join(cwd, '.agent/workflows/kiro-spec-init.md');
    expect(await exists(cmd)).toBe(true);

    const skill = join(cwd, '.agent/skills/kiro-sdd/SKILL.md');
    expect(await exists(skill)).toBe(true);

    const settingsTemplate = join(cwd, '.kiro/settings/templates/specs/init.json');
    expect(await exists(settingsTemplate)).toBe(true);

    expect(ctx.logs.join('\\n')).toMatch(/Setup completed: written=\d+, skipped=\d+/);
  });
});
