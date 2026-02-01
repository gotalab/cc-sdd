import { describe, it, expect } from 'vitest';
import { runCli } from '../src/index';
import { join } from 'node:path';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';

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

describe('real windsurf manifest', () => {
  it('dry-run prints plan for windsurf.json with placeholders applied (mac)', async () => {
    const repoRoot = join(process.cwd(), '..', '..');
    const manifestPath = join(repoRoot, 'tools/cc-sdd/templates/manifests/windsurf.json');
    const ctx = makeIO();
    const code = await runCli(['--dry-run', '--lang', 'en', '--agent', 'windsurf', '--manifest', manifestPath], runtime, ctx.io, {});
    expect(code).toBe(0);
    const out = ctx.logs.join('\n');
    expect(out).toMatch(/Plan \(dry-run\)/);
    expect(out).toContain('[templateDir] commands: templates/agents/windsurf/commands -> .windsurf/workflows');
    expect(out).toContain('[templateFile] doc_main: templates/agents/windsurf/docs/AGENTS.md -> ./AGENTS.md');
    expect(out).toContain('[templateDir] settings_common: templates/shared/settings -> .kiro/settings');
  });

  it('dry-run prints plan including commands for linux via mac template', async () => {
    const repoRoot = join(process.cwd(), '..', '..');
    const manifestPath = join(repoRoot, 'tools/cc-sdd/templates/manifests/windsurf.json');
    const ctx = makeIO();
    const runtimeLinux = { platform: 'linux' } as const;
    const code = await runCli(['--dry-run', '--lang', 'en', '--agent', 'windsurf', '--manifest', manifestPath], runtimeLinux, ctx.io, {});
    expect(code).toBe(0);
    const out = ctx.logs.join('\n');
    expect(out).toMatch(/Plan \(dry-run\)/);
    expect(out).toContain('[templateDir] commands: templates/agents/windsurf/commands -> .windsurf/workflows');
    expect(out).toContain('[templateFile] doc_main: templates/agents/windsurf/docs/AGENTS.md -> ./AGENTS.md');
    expect(out).toContain('[templateDir] settings_common: templates/shared/settings -> .kiro/settings');
  });

  it('shows windsurf recommendation message after applying plan', async () => {
    const repoRoot = join(process.cwd(), '..', '..');
    const manifestPath = join(repoRoot, 'tools/cc-sdd/templates/manifests/windsurf.json');
    const ctx = makeIO();

    const tmpDir = await mkdtemp(join(tmpdir(), 'ccsdd-windsurf-test-'));
    const templatesRoot = join(repoRoot, 'tools/cc-sdd');

    const code = await runCli(['--lang', 'en', '--agent', 'windsurf', '--manifest', manifestPath, '--yes'], runtime, ctx.io, {}, { cwd: tmpDir, templatesRoot });

    expect(code).toBe(0);
    const out = ctx.logs.join('\n');

    expect(out).toMatch(/Setup completed: written=\d+, skipped=\d+/);
    expect(out).toContain('Recommended models');
    expect(out).toContain('Claude Opus 4.5');
    expect(out).toContain('gpt-5.2-codex');
    expect(out).toContain('gpt-5.2');
    expect(out).toContain('Launch Windsurf IDE and run `/kiro-spec-init <what-to-build>` to create a new specification.');
    expect(out).toMatch(
      /Tip: Steering holds persistent project knowledge—patterns, standards, and org-wide policies\. Kick off `\/kiro-steering` \(essential for existing projects\) and\s+`\/kiro-steering-custom <what-to-create-custom-steering-document>`\. Maintain Regularly/,
    );
  });
});
