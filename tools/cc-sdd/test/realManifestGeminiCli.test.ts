import { describe, it, expect } from 'vitest';
import { runCli } from '../src/index';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { makeIO, mkTmp, exists, getRepoRoot } from './helpers/testUtils.js';

const repoRoot = getRepoRoot();
const manifestPath = join(repoRoot, 'tools/cc-sdd/templates/manifests/gemini-cli.json');

describe('real gemini-cli manifest (mac)', () => {
  const runtimeDarwin = { platform: 'darwin' } as const;

  it('dry-run prints plan for gemini-cli.json with placeholders applied', async () => {
    const ctx = makeIO();
    const code = await runCli(['--dry-run', '--lang', 'en', '--agent', 'gemini-cli', '--manifest', manifestPath], runtimeDarwin, ctx.io, {});
    expect(code).toBe(0);
    const out = ctx.logs.join('\n');
    expect(out).toMatch(/Plan \(dry-run\)/);
    expect(out).toContain('[templateDir] commands: templates/agents/gemini-cli/commands -> .gemini/commands/kiro');
    expect(out).toContain('[templateFile] doc_main: templates/agents/gemini-cli/docs/GEMINI.md -> ./GEMINI.md');
    expect(out).toContain('[templateDir] settings_common: templates/shared/settings -> .kiro/settings');
  });

  it('apply writes GEMINI.md and command files to cwd', async () => {
    const cwd = await mkTmp('ccsdd-real-manifest-gemini-');
    const ctx = makeIO();
    const code = await runCli(['--lang', 'en', '--agent', 'gemini-cli', '--manifest', manifestPath, '--overwrite=force'], runtimeDarwin, ctx.io, {}, { cwd, templatesRoot: process.cwd() });
    expect(code).toBe(0);

    const doc = join(cwd, 'GEMINI.md');
    expect(await exists(doc)).toBe(true);
    const text = await readFile(doc, 'utf8');
    expect(text).toMatch(/# AI-DLC and Spec-Driven Development/);

    const cmd = join(cwd, '.gemini/commands/kiro/spec-init.toml');
    expect(await exists(cmd)).toBe(true);

    const settingsRule = join(cwd, '.kiro/settings/rules/design-principles.md');
    expect(await exists(settingsRule)).toBe(true);

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
    expect(out).toContain('[templateDir] commands: templates/agents/gemini-cli/commands -> .gemini/commands/kiro');
    expect(out).toContain('[templateFile] doc_main: templates/agents/gemini-cli/docs/GEMINI.md -> ./GEMINI.md');
    expect(out).toContain('[templateDir] settings_common: templates/shared/settings -> .kiro/settings');
  });

  it('apply writes GEMINI.md and command files to cwd on linux', async () => {
    const cwd = await mkTmp('ccsdd-real-manifest-gemini-');
    const ctx = makeIO();
    const code = await runCli(['--lang', 'en', '--agent', 'gemini-cli', '--manifest', manifestPath, '--overwrite=force'], runtimeLinux, ctx.io, {}, { cwd, templatesRoot: process.cwd() });
    expect(code).toBe(0);

    const doc = join(cwd, 'GEMINI.md');
    expect(await exists(doc)).toBe(true);
    const text = await readFile(doc, 'utf8');
    expect(text).toMatch(/# AI-DLC and Spec-Driven Development/);

    const cmd = join(cwd, '.gemini/commands/kiro/spec-init.toml');
    expect(await exists(cmd)).toBe(true);

    const settingsTemplate = join(cwd, '.kiro/settings/templates/specs/init.json');
    expect(await exists(settingsTemplate)).toBe(true);

    expect(ctx.logs.join('\n')).toMatch(/Setup completed: written=\d+, skipped=\d+/);
  });
});
