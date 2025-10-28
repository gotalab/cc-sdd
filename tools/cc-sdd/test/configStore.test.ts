import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import { writeFile, readFile, stat } from 'node:fs/promises';
import { loadUserConfig, saveUserConfig } from '../src/cli/store';
import type { UserConfig } from '../src/cli/config';
import { mkTmp } from './helpers/testUtils.js';

describe('config store', () => {
  it('returns empty object when config file does not exist', async () => {
    const dir = await mkTmp("ccsdd-store-");
    const cfg = await loadUserConfig(dir);
    expect(cfg).toEqual({});
  });

  it('saves and loads config round-trip', async () => {
    const dir = await mkTmp("ccsdd-store-");
    const input: UserConfig = {
      agent: 'gemini-cli',
      lang: 'en',
      os: 'linux',
      kiroDir: '.work/kiro',
      overwrite: 'skip',
      backupDir: 'bk',
      agentLayouts: {
        'gemini-cli': { commandsDir: '.gemini/commands/custom' },
      },
    };
    await saveUserConfig(dir, input);

    const file = join(dir, '.cc-sdd.json');
    const st = await stat(file);
    expect(st.isFile()).toBe(true);

    const raw = await readFile(file, 'utf8');
    expect(raw.trim().startsWith('{')).toBe(true);

    const loaded = await loadUserConfig(dir);
    expect(loaded).toEqual(input);
  });

  it('throws a helpful error when JSON is invalid', async () => {
    const dir = await mkTmp("ccsdd-store-");
    const file = join(dir, '.cc-sdd.json');
    await writeFile(file, '{ invalid json', 'utf8');
    await expect(loadUserConfig(dir)).rejects.toThrow(/Invalid JSON/);
  });
});
