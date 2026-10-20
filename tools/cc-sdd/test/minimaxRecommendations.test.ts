import { describe, it, expect } from 'vitest';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runCli } from '../src/index';

const agents = [
  'claude-code',
  'claude-code-agent',
  'claude-code-skills',
  'opencode',
  'opencode-agent',
  'opencode-skills',
  'codex-skills',
  undefined,
];

describe('MiniMax installation recommendations', () => {
  it.each(agents)('shows Flash before M3 for %s without changing model settings', async (agent) => {
    const cwd = await mkdtemp(join(tmpdir(), 'ccsdd-minimax-'));
    const settings = [
      ['.claude/settings.json', '{"model":"MiniMax-M2.7","env":{"ANTHROPIC_BASE_URL":"https://example.test/anthropic"}}'],
      ['opencode.json', '{"model":"custom/saved-model","small_model":"minimax/MiniMax-M3"}'],
      ['.codex/config.toml', 'model = "custom-saved-model"\nmodel_provider = "custom"\n'],
    ];
    await mkdir(join(cwd, '.claude'));
    await mkdir(join(cwd, '.codex'));
    for (const [file, content] of settings) {
      await writeFile(join(cwd, file), content, 'utf8');
    }
    const logs: string[] = [];
    const errors: string[] = [];
    const code = await runCli(
      ['--lang', 'en', '--overwrite=skip', ...(agent ? ['--agent', agent] : [])],
      { platform: 'linux' },
      { log: (message) => logs.push(message), error: (message) => errors.push(message), exit: () => {} },
      {},
      { cwd, templatesRoot: process.cwd() },
    );

    expect(errors).toEqual([]);
    expect(code).toBe(0);
    expect(logs.join('\n')).toMatch(/\d+\/\d+ files written/);
    expect(logs.filter((line) => line.includes('MiniMax-')).map((line) => line.match(/MiniMax-[\w.-]+/)?.[0]))
      .toEqual(['MiniMax-M3.1-Flash', 'MiniMax-M3']);
    for (const [file, content] of settings) {
      expect(await readFile(join(cwd, file), 'utf8')).toBe(content);
    }
  });
});
