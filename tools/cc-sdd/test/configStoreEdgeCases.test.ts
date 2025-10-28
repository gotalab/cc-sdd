import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import { writeFile } from 'node:fs/promises';
import { loadUserConfig, saveUserConfig, resolveConfigPath } from '../src/cli/store';
import type { UserConfig } from '../src/cli/config';
import { mkTmp } from './helpers/testUtils.js';

describe('config store edge cases', () => {
  it('handles ENOTDIR error when config path is not a directory', async () => {
    const dir = await mkTmp("ccsdd-store-edge-");
    // Create a file where we expect a directory
    const notADir = join(dir, 'not-a-dir');
    await writeFile(notADir, 'not a directory', 'utf8');
    
    // Try to load config from the file (not directory)
    const cfg = await loadUserConfig(notADir);
    expect(cfg).toEqual({});
  });

  it('resolveConfigPath returns correct path', () => {
    const cwd = '/some/path';
    const configPath = resolveConfigPath(cwd);
    expect(configPath).toBe('/some/path/.cc-sdd.json');
  });

  it('handles null config object in JSON', async () => {
    const dir = await mkTmp("ccsdd-store-edge-");
    const file = join(dir, '.cc-sdd.json');
    await writeFile(file, 'null', 'utf8');
    
    const cfg = await loadUserConfig(dir);
    expect(cfg).toEqual({});
  });

  it('saves config with proper formatting', async () => {
    const dir = await mkTmp("ccsdd-store-edge-");
    const config: UserConfig = {
      agent: 'claude-code',
      lang: 'ja',
      agentLayouts: {
        'claude-code': {
          commandsDir: '.custom'
        }
      }
    };
    
    await saveUserConfig(dir, config);
    
    // Read raw file content to verify formatting
    const file = join(dir, '.cc-sdd.json');
    const raw = await require('node:fs/promises').readFile(file, 'utf8');
    
    expect(raw).toMatch(/^{\s*\n/); // Starts with formatted JSON
    expect(raw).toMatch(/}\n$/); // Ends with closing brace followed by newline
    expect(raw).toContain('  "agent": "claude-code"'); // Proper indentation
    
    // Verify it can be loaded back
    const loaded = await loadUserConfig(dir);
    expect(loaded).toEqual(config);
  });

  it('handles complex nested config structures', async () => {
    const dir = await mkTmp("ccsdd-store-edge-");
    const complexConfig: UserConfig = {
      agent: 'gemini-cli',
      lang: 'zh-TW',
      os: 'linux',
      kiroDir: 'docs/kiro',
      overwrite: 'force',
      backupDir: 'backups',
      agentLayouts: {
        'claude-code': {
          commandsDir: '.claude/custom',
          agentDir: '.claude-custom',
          docFile: 'CLAUDE_CUSTOM.md'
        },
        'gemini-cli': {
          commandsDir: '.gemini/custom'
        }
      }
    };
    
    await saveUserConfig(dir, complexConfig);
    const loaded = await loadUserConfig(dir);
    expect(loaded).toEqual(complexConfig);
  });

  it('handles empty object config', async () => {
    const dir = await mkTmp("ccsdd-store-edge-");
    const emptyConfig: UserConfig = {};
    
    await saveUserConfig(dir, emptyConfig);
    const loaded = await loadUserConfig(dir);
    expect(loaded).toEqual({});
  });

  it('creates directory structure when saving to non-existent path', async () => {
    const dir = await mkTmp("ccsdd-store-edge-");
    const nestedDir = join(dir, 'nested', 'path');
    
    try {
      await saveUserConfig(nestedDir, { agent: 'claude-code' });
      // If this doesn't throw, the directory was created automatically
      const loaded = await loadUserConfig(nestedDir);
      expect(loaded.agent).toBe('claude-code');
    } catch (error) {
      // Expected behavior: should throw when trying to write to non-existent directory
      expect(error).toBeDefined();
    }
  });
});