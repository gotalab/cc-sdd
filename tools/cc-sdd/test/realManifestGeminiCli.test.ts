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

const mkTmp = async () => mkdtemp(join(tmpdir(), 'ccsdd-real-manifest-gemini-'));
const exists = async (p: string) => { try { await stat(p); return true; } catch { return false; } };

// vitest runs in tools/cc-sdd; repoRoot is two levels up
const repoRoot = join(process.cwd(), '..', '..');
const manifestPath = join(repoRoot, 'tools/cc-sdd/templates/manifests/gemini-cli.json');

describe('real gemini-cli manifest (mac)', () => {
  const runtimeDarwin = { platform: 'darwin' } as const;

  it('dry-run prints plan for gemini-cli.json with placeholders applied', async () => {
    const ctx = makeIO();
    const code = await runCli(['--dry-run', '--lang', 'en', '--agent', 'gemini-cli', '--manifest', manifestPath], runtimeDarwin, ctx.io, {});
    expect(code).toBe(0);
    const out = ctx.logs.join('\n');
    expect(out).toMatch(/Plan \(dry-run\)/);
    expect(out).toContain('[templateDir] commands_os_mac: templates/agents/gemini-cli/commands/os-mac -> .gemini/commands/kiro');
    expect(out).toContain('[templateFile] doc_main: templates/agents/gemini-cli/docs/GEMINI.tpl.md -> ./GEMINI.md');
  });

  it('apply writes GEMINI.md and command files to cwd', async () => {
    const cwd = await mkTmp();
    const ctx = makeIO();
    const code = await runCli(['--lang', 'en', '--agent', 'gemini-cli', '--manifest', manifestPath, '--overwrite=force'], runtimeDarwin, ctx.io, {}, { cwd, templatesRoot: process.cwd() });
    expect(code).toBe(0);

    const doc = join(cwd, 'GEMINI.md');
    expect(await exists(doc)).toBe(true);
    const text = await readFile(doc, 'utf8');
    expect(text).toMatch(/Gemini CLI Spec-Driven Development/);

    const cmd = join(cwd, '.gemini/commands/kiro/spec-init.toml');
    expect(await exists(cmd)).toBe(true);

    expect(ctx.logs.join('\n')).toMatch(/Setup completed: written=\d+, skipped=\d+/);
  });
});

describe('real gemini-cli manifest (linux)', () => {
  const runtimeLinux = { platform: 'linux' } as const;

  it('dry-run prints plan including commands for linux via windows template', async () => {
    const ctx = makeIO();
    const code = await runCli(['--dry-run', '--lang', 'en', '--agent', 'gemini-cli', '--manifest', manifestPath], runtimeLinux, ctx.io, {});
    expect(code).toBe(0);
    const out = ctx.logs.join('\n');
    expect(out).toMatch(/Plan \(dry-run\)/);
    expect(out).toContain('[templateDir] commands_os_windows: templates/agents/gemini-cli/commands/os-windows -> .gemini/commands/kiro');
    expect(out).toContain('[templateFile] doc_main: templates/agents/gemini-cli/docs/GEMINI.tpl.md -> ./GEMINI.md');
  });

  it('apply writes GEMINI.md and command files to cwd on linux', async () => {
    const cwd = await mkTmp();
    const ctx = makeIO();
    const code = await runCli(['--lang', 'en', '--agent', 'gemini-cli', '--manifest', manifestPath, '--overwrite=force'], runtimeLinux, ctx.io, {}, { cwd, templatesRoot: process.cwd() });
    expect(code).toBe(0);

    const doc = join(cwd, 'GEMINI.md');
    expect(await exists(doc)).toBe(true);
    const text = await readFile(doc, 'utf8');
    expect(text).toMatch(/Gemini CLI Spec-Driven Development/);

    const cmd = join(cwd, '.gemini/commands/kiro/spec-init.toml');
    expect(await exists(cmd)).toBe(true);

    expect(ctx.logs.join('\n')).toMatch(/Setup completed: written=\d+, skipped=\d+/);
  });
});
