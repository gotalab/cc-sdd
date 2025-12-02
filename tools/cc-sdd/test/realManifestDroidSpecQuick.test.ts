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
const exists = async (p: string) => {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
};

// vitest runs in tools/cc-sdd; repoRoot is two levels up
const repoRoot = join(process.cwd(), '..', '..');
const manifestPath = join(repoRoot, 'tools/cc-sdd/templates/manifests/droid.json');

describe('droid spec-quick wiring', () => {
  it('includes spec-quick command in manifest apply', async () => {
    const cwd = await mkTmp();
    const ctx = makeIO();
    const code = await runCli(
      ['--lang', 'en', '--manifest', manifestPath, '--overwrite=force', '--droid'],
      runtime,
      ctx.io,
      {},
      { cwd, templatesRoot: process.cwd() },
    );
    expect(code).toBe(0);

    // Command exists
    const cmd = join(cwd, '.factory/commands/spec-quick.md');
    expect(await exists(cmd)).toBe(true);
    const cmdText = await readFile(cmd, 'utf8');
    expect(cmdText).toMatch(/Quick Spec Generator/);

  });
});
