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
const manifestPath = join(repoRoot, 'tools/cc-sdd/templates/manifests/opencode-agent.json');

describe('real opencode-agent manifest', () => {
  it('dry-run prints plan for opencode-agent.json with placeholders applied', async () => {
    const ctx = makeIO();
    const code = await runCli(['--dry-run', '--lang', 'en', '--manifest', manifestPath, '--opencode-agent'], runtime, ctx.io, {});
    expect(code).toBe(0);
    const out = ctx.logs.join('\n');
    expect(out).toMatch(/Plan \(dry-run\)/);
    expect(out).toContain('[templateDir] commands: templates/agents/opencode-agent/commands -> .opencode/commands');
    expect(out).toContain('[templateDir] agents_library: templates/agents/opencode-agent/agents -> .opencode/agents/kiro');
    expect(out).toContain('[templateFile] doc_main: templates/agents/opencode-agent/docs/AGENTS.md -> ./AGENTS.md');
    expect(out).toContain('[templateDir] settings_common: templates/shared/settings -> .kiro/settings');
  });

  it('apply writes AGENTS.md, command files, and agent library docs to cwd', async () => {
    const cwd = await mkTmp();
    const ctx = makeIO();
    const code = await runCli(['--lang', 'en', '--manifest', manifestPath, '--overwrite=force', '--opencode-agent'], runtime, ctx.io, {}, { cwd, templatesRoot: process.cwd() });
    expect(code).toBe(0);

    const doc = join(cwd, 'AGENTS.md');
    expect(await exists(doc)).toBe(true);
    const text = await readFile(doc, 'utf8');
    expect(text).toMatch(/# AI-DLC and Spec-Driven Development/);

    const cmd = join(cwd, '.opencode/commands/kiro-spec-init.md');
    expect(await exists(cmd)).toBe(true);

    const agentSpecImpl = join(cwd, '.opencode/agents/kiro/spec-impl.md');
    expect(await exists(agentSpecImpl)).toBe(true);
    const agentSpecImplText = await readFile(agentSpecImpl, 'utf8');
    expect(agentSpecImplText).toMatch(/Subagent/);

    const settingsRule = join(cwd, '.kiro/settings/rules/design-principles.md');
    expect(await exists(settingsRule)).toBe(true);

    expect(ctx.logs.join('\n')).toMatch(/Setup completed: written=\d+, skipped=\d+/);
  });
});
