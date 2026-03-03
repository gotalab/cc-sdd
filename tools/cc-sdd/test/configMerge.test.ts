import { describe, it, expect } from 'vitest';
import { parseArgs } from '../src/cli/args';
import { mergeConfigAndArgs, type UserConfig, type ResolvedConfig } from '../src/cli/config';

const runtimeDarwin = { platform: 'darwin' } as const;

describe('mergeConfigAndArgs', () => {
  it('applies defaults when args and config are empty', () => {
    const args = parseArgs([]);
    const cfg: UserConfig = {};
    const out = mergeConfigAndArgs(args, cfg, runtimeDarwin);
    const expected: Partial<ResolvedConfig> = {
      agent: 'claude-code-skills',
      os: 'auto',
      resolvedOs: 'mac',
      lang: 'en',
      kiroDir: '.kiro',
      overwrite: 'prompt',
      effectiveOverwrite: 'prompt',
      backupEnabled: false,
      backupDir: '.cc-sdd.backup',
      dryRun: false,
    };
    expect(out).toMatchObject(expected);
    expect(out.layout.commandsDir).toBe('.claude/skills');
  });

  it('respects precedence: CLI > config > defaults', () => {
    const args = parseArgs([
      '--agent', 'qwen-code',
      '--lang', 'zh-TW',
      '--os', 'mac',
      '--kiro-dir', '.work/kiro',
      '--overwrite', 'force',
      '--backup', 'bk',
      '--dry-run',
      '--yes',
    ]);

    const cfg: UserConfig = {
      agent: 'gemini-cli',
      os: 'linux',
      lang: 'en',
      kiroDir: 'docs/kiro',
      overwrite: 'skip',
      backupDir: '.bk',
    };

    const out = mergeConfigAndArgs(args, cfg, runtimeDarwin);
    expect(out.agent).toBe('qwen-code');
    expect(out.lang).toBe('zh-TW');
    expect(out.os).toBe('mac');
    expect(out.resolvedOs).toBe('mac');
    expect(out.kiroDir).toBe('.work/kiro');
    expect(out.overwrite).toBe('force');
    expect(out.effectiveOverwrite).toBe('force');
    expect(out.backupEnabled).toBe(true);
    expect(out.backupDir).toBe('bk');
    expect(out.dryRun).toBe(true);
  });

  it('handles --yes with overwrite=prompt by switching to force (effective)', () => {
    const args = parseArgs(['--yes']);
    const cfg: UserConfig = { overwrite: 'prompt' };
    const out = mergeConfigAndArgs(args, cfg, runtimeDarwin);
    expect(out.overwrite).toBe('prompt');
    expect(out.effectiveOverwrite).toBe('force');
  });

  it('validates kiroDir via precedence and throws on invalid path', () => {
    const args = parseArgs([]);
    const cfg: UserConfig = { kiroDir: '/abs' };
    expect(() => mergeConfigAndArgs(args, cfg, runtimeDarwin)).toThrowError(/kiroDir/i);
  });

  it('applies agentLayouts override into layout resolution', () => {
    const args = parseArgs([]);
    const cfg: UserConfig = {
      agentLayouts: {
        'claude-code-skills': { commandsDir: '.claude/skills/custom' },
      },
    };
    const out = mergeConfigAndArgs(args, cfg, runtimeDarwin);
    expect(out.layout.commandsDir).toBe('.claude/skills/custom');
  });

  describe('effectiveOverwrite logic', () => {
    it('preserves skip mode regardless of --yes flag', () => {
      const argsWithYes = parseArgs(['--yes', '--overwrite', 'skip']);
      const argsWithoutYes = parseArgs(['--overwrite', 'skip']);
      
      const outWithYes = mergeConfigAndArgs(argsWithYes, {}, runtimeDarwin);
      const outWithoutYes = mergeConfigAndArgs(argsWithoutYes, {}, runtimeDarwin);
      
      expect(outWithYes.overwrite).toBe('skip');
      expect(outWithYes.effectiveOverwrite).toBe('skip');
      expect(outWithoutYes.overwrite).toBe('skip');
      expect(outWithoutYes.effectiveOverwrite).toBe('skip');
    });

    it('preserves force mode regardless of --yes flag', () => {
      const argsWithYes = parseArgs(['--yes', '--overwrite', 'force']);
      const argsWithoutYes = parseArgs(['--overwrite', 'force']);
      
      const outWithYes = mergeConfigAndArgs(argsWithYes, {}, runtimeDarwin);
      const outWithoutYes = mergeConfigAndArgs(argsWithoutYes, {}, runtimeDarwin);
      
      expect(outWithYes.overwrite).toBe('force');
      expect(outWithYes.effectiveOverwrite).toBe('force');
      expect(outWithoutYes.overwrite).toBe('force');
      expect(outWithoutYes.effectiveOverwrite).toBe('force');
    });

    it('keeps prompt mode as-is without --yes flag', () => {
      const args = parseArgs(['--overwrite', 'prompt']);
      const out = mergeConfigAndArgs(args, {}, runtimeDarwin);
      
      expect(out.overwrite).toBe('prompt');
      expect(out.effectiveOverwrite).toBe('prompt');
    });

    it('uses default prompt mode without --yes', () => {
      const args = parseArgs([]);
      const out = mergeConfigAndArgs(args, {}, runtimeDarwin);
      
      expect(out.overwrite).toBe('prompt');
      expect(out.effectiveOverwrite).toBe('prompt');
    });
  });
});
