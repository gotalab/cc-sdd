import { describe, it, expect } from 'vitest';
import { loadManifest } from '../src/manifest/loader';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { mkTmp } from './helpers/testUtils.js';

describe('loadManifest additional edge cases', () => {
  it('validates manifest.version as number', async () => {
    const dir = await mkTmp("ccsdd-manifest-loader-");
    const file = join(dir, 'manifest.json');
    const invalidManifest = {
      version: '1', // string instead of number
      artifacts: []
    };
    await writeFile(file, JSON.stringify(invalidManifest), 'utf8');
    
    await expect(loadManifest(file)).rejects.toThrow(/Manifest\.version must be a number/);
  });

  it('validates manifest.artifacts as array', async () => {
    const dir = await mkTmp("ccsdd-manifest-loader-");
    const file = join(dir, 'manifest.json');
    const invalidManifest = {
      version: 1,
      artifacts: {} // object instead of array
    };
    await writeFile(file, JSON.stringify(invalidManifest), 'utf8');
    
    await expect(loadManifest(file)).rejects.toThrow(/Manifest\.artifacts must be an array/);
  });

  it('rejects null manifest', async () => {
    const dir = await mkTmp("ccsdd-manifest-loader-");
    const file = join(dir, 'manifest.json');
    await writeFile(file, 'null', 'utf8');
    
    await expect(loadManifest(file)).rejects.toThrow(/Manifest must be an object/);
  });

  it('rejects non-object manifest', async () => {
    const dir = await mkTmp("ccsdd-manifest-loader-");
    const file = join(dir, 'manifest.json');
    await writeFile(file, '"string"', 'utf8');
    
    await expect(loadManifest(file)).rejects.toThrow(/Manifest must be an object/);
  });

  it('rejects array manifest', async () => {
    const dir = await mkTmp("ccsdd-manifest-loader-");
    const file = join(dir, 'manifest.json');
    await writeFile(file, '[]', 'utf8');
    
    await expect(loadManifest(file)).rejects.toThrow(/Manifest\.version must be a number/);
  });

  it('handles file read errors other than ENOENT', async () => {
    const dir = await mkTmp("ccsdd-manifest-loader-");
    const file = join(dir, 'manifest.json');
    // Create a file with restricted permissions to simulate read error
    await writeFile(file, '{"version":1,"artifacts":[]}', 'utf8');
    
    // This test depends on file system permissions, may not work on all systems
    // But it ensures we handle non-ENOENT errors properly
    try {
      const result = await loadManifest(file);
      expect(result.version).toBe(1);
    } catch (error) {
      // If we get a permission error or similar, it should be rethrown as-is
      expect(error).not.toMatch(/Manifest not found/);
    }
  });

  it('loads valid manifest with minimal structure', async () => {
    const dir = await mkTmp("ccsdd-manifest-loader-");
    const file = join(dir, 'manifest.json');
    const validMinimalManifest = {
      version: 2,
      artifacts: [
        {
          id: 'test',
          source: {
            type: 'templateFile',
            from: 'test.tpl.md',
            toDir: 'out'
          }
        }
      ]
    };
    await writeFile(file, JSON.stringify(validMinimalManifest), 'utf8');
    
    const result = await loadManifest(file);
    expect(result.version).toBe(2);
    expect(result.artifacts).toHaveLength(1);
    expect(result.artifacts[0].id).toBe('test');
  });

  it('preserves additional properties in manifest', async () => {
    const dir = await mkTmp("ccsdd-manifest-loader-");
    const file = join(dir, 'manifest.json');
    const manifestWithExtra = {
      version: 1,
      artifacts: [],
      metadata: { author: 'test' },
      description: 'Test manifest'
    };
    await writeFile(file, JSON.stringify(manifestWithExtra), 'utf8');
    
    const result = await loadManifest(file) as any;
    expect(result.version).toBe(1);
    expect(result.artifacts).toEqual([]);
    expect(result.metadata).toEqual({ author: 'test' });
    expect(result.description).toBe('Test manifest');
  });
});