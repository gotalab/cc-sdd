import { describe, it, expect } from 'vitest';
import { runCli } from '../src/index';
import { mkdtemp, writeFile, mkdir, readFile, stat } from 'node:fs/promises';
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

const mkTmp = async () => mkdtemp(join(tmpdir(), 'ccsdd-cli-apply-'));
const exists = async (p: string) => { try { await stat(p); return true; } catch { return false; } };

describe('CLI apply with manifest', () => {
  it('applies a plan to cwd using provided templatesRoot', async () => {
    const templatesRoot = await mkTmp();
    const cwd = await mkTmp();

    // Prepare template and manifest
    await mkdir(templatesRoot, { recursive: true });
    await writeFile(join(templatesRoot, 'doc.tpl.md'), '# Hello {{AGENT}}', 'utf8');

    const manifestDir = await mkTmp();
    const manifestPath = join(manifestDir, 'manifest.json');
    const m = {
      version: 1,
      artifacts: [
        {
          id: 'doc',
          source: { type: 'templateFile' as const, from: 'doc.tpl.md', toDir: '{{AGENT_DIR}}', rename: '{{AGENT_DOC}}' },
        },
      ],
    };
    await writeFile(manifestPath, JSON.stringify(m), 'utf8');

    const ctx = makeIO();
    const code = await runCli(['--manifest', manifestPath], runtime, ctx.io, {}, { cwd, templatesRoot });
    expect(code).toBe(0);
    const out = join(cwd, '.claude/CLAUDE.md');
    expect(await exists(out)).toBe(true);
    expect((await readFile(out, 'utf8')).trim()).toMatch(/Hello claude-code-skills/);
    // New output includes emoji and colon; match the stable part
    expect(ctx.logs.join('\n')).toMatch(/1\/1 files written/);
  });
});
