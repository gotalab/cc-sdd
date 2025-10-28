import { describe, it, expect } from 'vitest';
import { runCli } from '../src/index';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { makeIO, mkTmp, exists, getRepoRoot } from './helpers/testUtils.js';

const runtime = { platform: 'darwin' } as const;
const repoRoot = getRepoRoot();
const manifestPath = join(repoRoot, 'tools/cc-sdd/templates/manifests/claude-code-agent.json');

describe('real claude-code-agent manifest', () => {
  it('dry-run prints plan for claude-code-agent.json with placeholders applied', async () => {
    const ctx = makeIO();
    const code = await runCli(['--dry-run', '--lang', 'en', '--manifest', manifestPath, '--claude-agent'], runtime, ctx.io, {});
    expect(code).toBe(0);
    const out = ctx.logs.join('\n');
    expect(out).toMatch(/Plan \(dry-run\)/);
    expect(out).toContain('[templateDir] commands: templates/agents/claude-code-agent/commands -> .claude/commands/kiro');
    expect(out).toContain('[templateDir] agents_library: templates/agents/claude-code-agent/agents -> .claude/agents/kiro');
    expect(out).toContain('[templateFile] doc_main: templates/agents/claude-code-agent/docs/CLAUDE.md -> ./CLAUDE.md');
    expect(out).toContain('[templateDir] settings_common: templates/shared/settings -> .kiro/settings');
  });

  it('apply writes CLAUDE.md, command files, and agent library docs to cwd', async () => {
    const cwd = await mkTmp('ccsdd-real-manifest-');
    const ctx = makeIO();
    const code = await runCli(['--lang', 'en', '--manifest', manifestPath, '--overwrite=force', '--claude-agent'], runtime, ctx.io, {}, { cwd, templatesRoot: process.cwd() });
    expect(code).toBe(0);

    const doc = join(cwd, 'CLAUDE.md');
    expect(await exists(doc)).toBe(true);
    const text = await readFile(doc, 'utf8');
    expect(text).toMatch(/# AI-DLC and Spec-Driven Development/);

    const cmd = join(cwd, '.claude/commands/kiro/spec-init.md');
    expect(await exists(cmd)).toBe(true);

    const agentSpecImpl = join(cwd, '.claude/agents/kiro/spec-impl.md');
    expect(await exists(agentSpecImpl)).toBe(true);
    const agentSpecImplText = await readFile(agentSpecImpl, 'utf8');
    expect(agentSpecImplText).toMatch(/SubAgent/);

    const settingsRule = join(cwd, '.kiro/settings/rules/design-principles.md');
    expect(await exists(settingsRule)).toBe(true);

    expect(ctx.logs.join('\n')).toMatch(/Setup completed: written=\d+, skipped=\d+/);
  });
});
