import { describe, it, expect } from 'vitest';
import { runCli } from '../src/index';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { mkTmp } from './helpers/testUtils.js';

const runtime = { platform: 'darwin' } as const;

const makeIO = () => {
  const logs: string[] = [];
  const errs: string[] = [];
  let exitCode: number | null = null;
  return {
    io: {
      log: (m: string) => logs.push(m),
      error: (m: string) => errs.push(m),
      exit: (c: number) => {
        exitCode = c;
      },
    },
    get logs() { return logs; },
    get errs() { return errs; },
    get exitCode() { return exitCode; }
  };
};

describe('CLI entry edge cases', () => {
  it('handles multiple help flags', async () => {
    const ctx = makeIO();
    const code = await runCli(['--help', '-h'], runtime, ctx.io, {});
    expect(code).toBe(0);
    expect(ctx.logs.join('\n')).toMatch(/Usage: cc-sdd/);
  });

  it('handles multiple version flags', async () => {
    const ctx = makeIO();
    const code = await runCli(['--version', '-v'], runtime, ctx.io, {});
    expect(code).toBe(0);
    expect(ctx.logs.join('\n')).toMatch(/cc-sdd v/);
  });

  it('prioritizes help over version', async () => {
    const ctx = makeIO();
    const code = await runCli(['--version', '--help'], runtime, ctx.io, {});
    expect(code).toBe(0);
    expect(ctx.logs.join('\n')).toMatch(/Usage: cc-sdd/);
    expect(ctx.logs.join('\n')).not.toMatch(/cc-sdd v/);
  });

  it('handles missing manifest file in dry-run mode', async () => {
    const ctx = makeIO();
    const nonExistentManifest = '/path/that/does/not/exist/manifest.json';
    const code = await runCli(['--dry-run', '--manifest', nonExistentManifest], runtime, ctx.io, {});
    expect(code).toBe(1);
    expect(ctx.errs.join('\n')).toMatch(/Manifest not found/);
  });

  it('handles invalid manifest file in dry-run mode', async () => {
    const dir = await mkTmp("ccsdd-cli-edge-");
    const manifestPath = join(dir, 'invalid.json');
    await writeFile(manifestPath, '{ invalid json', 'utf8');
    
    const ctx = makeIO();
    const code = await runCli(['--dry-run', '--manifest', manifestPath], runtime, ctx.io, {});
    expect(code).toBe(1);
    expect(ctx.errs.join('\n')).toMatch(/Invalid JSON/);
  });

  it('handles missing manifest file in apply mode', async () => {
    const ctx = makeIO();
    const nonExistentManifest = '/path/that/does/not/exist/manifest.json';
    const code = await runCli(['--manifest', nonExistentManifest], runtime, ctx.io, {});
    expect(code).toBe(1);
    expect(ctx.errs.join('\n')).toMatch(/Manifest not found/);
  });

  it('resolves default manifest path correctly', async () => {
    const templatesRoot = await mkTmp("ccsdd-cli-edge-");
    const manifestsDir = join(templatesRoot, 'templates', 'manifests');
    await mkdir(manifestsDir, { recursive: true });
    
    const manifestPath = join(manifestsDir, 'claude-code.json');
    const manifest = {
      version: 1,
      artifacts: [
        {
          id: 'test',
          source: {
            type: 'templateFile' as const,
            from: 'test.tpl.md',
            toDir: 'out'
          }
        }
      ]
    };
    await writeFile(manifestPath, JSON.stringify(manifest), 'utf8');
    await writeFile(join(templatesRoot, 'test.tpl.md'), '# Test {{AGENT}}', 'utf8');
    
    const ctx = makeIO();
    const code = await runCli(['--dry-run'], runtime, ctx.io, {}, { templatesRoot });
    expect(code).toBe(0);
    expect(ctx.logs.join('\n')).toMatch(/Plan \(dry-run\)/);
  });

  it('prefers minimal manifest when profile=minimal', async () => {
    const templatesRoot = await mkTmp("ccsdd-cli-edge-");
    const manifestsDir = join(templatesRoot, 'templates', 'manifests');
    await mkdir(manifestsDir, { recursive: true });
    
    const fullManifest = {
      version: 1,
      artifacts: [
        { id: 'full1', source: { type: 'templateFile' as const, from: 'f1.tpl.md', toDir: 'out' } },
        { id: 'full2', source: { type: 'templateFile' as const, from: 'f2.tpl.md', toDir: 'out' } }
      ]
    };
    const minimalManifest = {
      version: 1,
      artifacts: [
        { id: 'min1', source: { type: 'templateFile' as const, from: 'm1.tpl.md', toDir: 'out' } }
      ]
    };
    
    await writeFile(join(manifestsDir, 'claude-code.json'), JSON.stringify(fullManifest), 'utf8');
    await writeFile(join(manifestsDir, 'claude-code-min.json'), JSON.stringify(minimalManifest), 'utf8');
    
    const ctx = makeIO();
    const code = await runCli(['--dry-run', '--profile', 'minimal'], runtime, ctx.io, {}, { templatesRoot });
    expect(code).toBe(0);
    const output = ctx.logs.join('\n');
    expect(output).toMatch(/min1/);
    expect(output).not.toMatch(/full1|full2/);
  });

  it('falls back to default manifest when minimal not found', async () => {
    const templatesRoot = await mkTmp("ccsdd-cli-edge-");
    const manifestsDir = join(templatesRoot, 'templates', 'manifests');
    await mkdir(manifestsDir, { recursive: true });
    
    const fullManifest = {
      version: 1,
      artifacts: [
        { id: 'full1', source: { type: 'templateFile' as const, from: 'f1.tpl.md', toDir: 'out' } }
      ]
    };
    
    await writeFile(join(manifestsDir, 'claude-code.json'), JSON.stringify(fullManifest), 'utf8');
    // No claude-code-min.json created
    
    const ctx = makeIO();
    const code = await runCli(['--dry-run', '--profile', 'minimal'], runtime, ctx.io, {}, { templatesRoot });
    expect(code).toBe(0);
    const output = ctx.logs.join('\n');
    expect(output).toMatch(/full1/);
  });

  it('handles empty argv array', async () => {
    const ctx = makeIO();
    const code = await runCli([], runtime, ctx.io, {});
    expect(code).toBe(0); // Actually succeeds if it can load default manifest
    // Will try to apply default manifest - may succeed or fail depending on templates
  });

  it('handles execution error in apply mode', async () => {
    const templatesRoot = await mkTmp("ccsdd-cli-edge-");
    const manifestPath = join(templatesRoot, 'manifest.json');
    const manifest = {
      version: 1,
      artifacts: [
        {
          id: 'test',
          source: {
            type: 'templateFile' as const,
            from: 'nonexistent.tpl.md', // This file doesn't exist
            toDir: 'out'
          }
        }
      ]
    };
    await writeFile(manifestPath, JSON.stringify(manifest), 'utf8');
    
    const ctx = makeIO();
    const code = await runCli(['--manifest', manifestPath], runtime, ctx.io, {}, { templatesRoot });
    expect(code).toBe(1);
    expect(ctx.errs.join('\n')).toMatch(/Error:/);
  });
});