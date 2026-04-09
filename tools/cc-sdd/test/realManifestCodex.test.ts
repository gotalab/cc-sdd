import { describe, it, expect } from 'vitest';
import { runCli } from '../src/index';

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

describe('codex prompts mode (deprecated)', () => {
  it('rejects --codex with error and suggests --codex-skills', async () => {
    const ctx = makeIO();
    const code = await runCli(['--agent', 'codex'], runtime, ctx.io, {});
    expect(code).toBe(1);
    const out = ctx.logs.join('\n');
    expect(out).toContain('no longer supported');
    expect(out).toContain('--codex-skills');
  });

  it('rejects --codex even with --dry-run', async () => {
    const ctx = makeIO();
    const code = await runCli(['--dry-run', '--agent', 'codex'], runtime, ctx.io, {});
    expect(code).toBe(1);
    const out = ctx.logs.join('\n');
    expect(out).toContain('no longer supported');
  });
});
