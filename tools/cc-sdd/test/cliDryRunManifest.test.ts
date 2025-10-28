import { describe, it, expect } from 'vitest';
import { runCli } from '../src/index';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { makeIO, mkTmp } from './helpers/testUtils.js';

const runtime = { platform: 'darwin' } as const;

describe('CLI dry-run with manifest', () => {
  it('prints a formatted plan from manifest', async () => {
    const dir = await mkTmp('ccsdd-cli-plan-');
    const file = join(dir, 'manifest.json');
    const m = {
      version: 1,
      artifacts: [
        {
          id: 'doc',
          source: {
            type: 'templateFile' as const,
            from: 'doc.tpl.md',
            toDir: '{{AGENT_DIR}}',
            rename: '{{AGENT_DOC}}',
          },
        },
      ],
    };
    await writeFile(file, JSON.stringify(m), 'utf8');

    const ctx = makeIO();
    const code = await runCli(['--dry-run', '--manifest', file], runtime, ctx.io, {});
    expect(code).toBe(0);
    const out = ctx.logs.join('\n');
    expect(out).toMatch(/Plan \(dry-run\)/);
    expect(out).toMatch(/\[templateFile\] doc: doc\.tpl\.md -> \.claude\/CLAUDE\.md/);
  });
});
