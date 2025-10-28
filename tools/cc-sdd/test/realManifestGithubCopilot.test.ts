import { describe, it, expect } from 'vitest';
import { runCli } from '../src/index';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { makeIO, mkTmp, exists, getRepoRoot } from './helpers/testUtils.js';

const runtime = { platform: 'darwin' } as const;
const repoRoot = getRepoRoot();
const manifestPath = join(repoRoot, 'tools/cc-sdd/templates/manifests/github-copilot.json');

describe('real github-copilot manifest', () => {
  it('dry-run prints plan with github-copilot templates', async () => {
    const ctx = makeIO();
    const code = await runCli(
      ['--dry-run', '--lang', 'en', '--agent', 'github-copilot', '--manifest', manifestPath],
      runtime,
      ctx.io,
      {},
    );
    expect(code).toBe(0);
    const out = ctx.logs.join('\n');
    expect(out).toMatch(/Plan \(dry-run\)/);
    expect(out).toContain('[templateDir] commands: templates/agents/github-copilot/commands -> .github/prompts');
    expect(out).toContain('[templateFile] doc_main: templates/agents/github-copilot/docs/AGENTS.md -> ./AGENTS.md');
    expect(out).toContain('[templateDir] settings_common: templates/shared/settings -> .kiro/settings');
  });

  it('apply writes AGENTS.md, prompts, and shared settings', async () => {
    const cwd = await mkTmp('ccsdd-real-manifest-ghcopilot-');
    const ctx = makeIO();
    const code = await runCli(
      ['--lang', 'en', '--agent', 'github-copilot', '--manifest', manifestPath, '--overwrite=force'],
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

    const prompt = join(cwd, '.github/prompts/kiro-spec-init.prompt.md');
    expect(await exists(prompt)).toBe(true);

    const settingsTemplate = join(cwd, '.kiro/settings/templates/specs/tasks.md');
    expect(await exists(settingsTemplate)).toBe(true);

    expect(ctx.logs.join('\n')).toMatch(/Setup completed: written=\d+, skipped=\d+/);
  });
});
