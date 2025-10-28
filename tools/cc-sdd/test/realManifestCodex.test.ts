import { describe, it, expect } from 'vitest';
import { runCli } from '../src/index';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { makeIO, mkTmp, exists, getRepoRoot } from './helpers/testUtils.js';

const runtime = { platform: 'darwin' } as const;
const repoRoot = getRepoRoot();
const manifestPath = join(repoRoot, 'tools/cc-sdd/templates/manifests/codex.json');

describe('real codex manifest', () => {
  it('dry-run prints plan for codex.json with placeholders applied', async () => {
    const ctx = makeIO();
    const code = await runCli(
      ['--dry-run', '--lang', 'en', '--agent', 'codex', '--manifest', manifestPath],
      runtime,
      ctx.io,
      {},
    );
    expect(code).toBe(0);
    const out = ctx.logs.join('\n');
    expect(out).toMatch(/Plan \(dry-run\)/);
    expect(out).toContain('[templateDir] commands: templates/agents/codex/commands -> .codex/prompts');
    expect(out).toContain('[templateFile] doc_main: templates/agents/codex/docs/AGENTS.md -> ./AGENTS.md');
    expect(out).toContain('[templateDir] settings_common: templates/shared/settings -> .kiro/settings');
  });

  it('apply writes AGENTS.md, commands, and settings to cwd', async () => {
    const cwd = await mkTmp('ccsdd-real-manifest-codex-');
    const ctx = makeIO();
    const code = await runCli(
      ['--lang', 'en', '--agent', 'codex', '--manifest', manifestPath, '--overwrite=force'],
      runtime,
      ctx.io,
      {},
      { cwd, templatesRoot: process.cwd() },
    );
    expect(code).toBe(0);

    const doc = join(cwd, 'AGENTS.md');
    expect(await exists(doc)).toBe(true);
    const text = await readFile(doc, 'utf8');
    expect(text).toMatch(/# AI-DLC and Spec-Driven Development/);

    const cmd = join(cwd, '.codex/prompts/kiro-spec-init.md');
    expect(await exists(cmd)).toBe(true);

    const settingsTemplate = join(cwd, '.kiro/settings/templates/specs/init.json');
    expect(await exists(settingsTemplate)).toBe(true);

    expect(ctx.logs.join('\n')).toMatch(/Setup completed: written=\d+, skipped=\d+/);
  });
});
