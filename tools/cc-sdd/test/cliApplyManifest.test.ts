import { describe, it, expect } from 'vitest';
import { runCli } from '../src/index';
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { makeIO, mkTmp, exists } from './helpers/testUtils.js';

const runtime = { platform: 'darwin' } as const;

describe('CLI apply with manifest', () => {
  it('applies a plan to cwd using provided templatesRoot', async () => {
    const templatesRoot = await mkTmp('ccsdd-cli-apply-');
    const cwd = await mkTmp('ccsdd-cli-apply-');

    // Prepare template and manifest
    await mkdir(templatesRoot, { recursive: true });
    await writeFile(join(templatesRoot, 'doc.tpl.md'), '# Hello {{AGENT}}', 'utf8');

    const manifestDir = await mkTmp('ccsdd-cli-apply-');
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
    expect((await readFile(out, 'utf8')).trim()).toMatch(/Hello claude-code/);
    // New output includes emoji and colon; match the stable part
    expect(ctx.logs.join('\n')).toMatch(/Setup completed: written=1, skipped=0/);
  });
});
