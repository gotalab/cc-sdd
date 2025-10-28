import { describe, it, expect } from 'vitest';
import { planFromManifest, planFromFile } from '../src/manifest/planner';
import { loadManifest } from '../src/manifest/loader';
import { mergeConfigAndArgs } from '../src/cli/config';
import { parseArgs } from '../src/cli/args';
import { join } from 'node:path';
import { writeFile } from 'node:fs/promises';
import { mkTmp } from './helpers/testUtils.js';

const runtimeDarwin = { platform: 'darwin' } as const;

describe('manifest planner glue', () => {
  it('plans artifacts from in-memory manifest using resolved config context', async () => {
    const args = parseArgs([]); // defaults to claude-code, ja, os:auto
    const resolved = mergeConfigAndArgs(args, {}, runtimeDarwin);

    const manifest = {
      version: 1,
      artifacts: [
        {
          id: 'commands_static_all',
          source: {
            type: 'staticDir' as const,
            from: 'templates/agents/{{AGENT}}/commands',
            toDir: '{{AGENT_COMMANDS_DIR}}',
          },
          when: { agent: ['claude-code'] },
        },
        {
          id: 'doc_tpl',
          source: {
            type: 'templateFile' as const,
            from: 'templates/docs/README.tpl.md',
            toDir: '{{AGENT_DIR}}',
            rename: '{{AGENT_DOC}}',
          },
        },
      ],
    };

    const plan = planFromManifest(manifest as any, resolved);
    expect(plan).toHaveLength(2);
    const staticDir = plan.find((p) => p.id === 'commands_static_all') as any;
    expect(staticDir.source.from).toBe('templates/agents/claude-code/commands');
    expect(staticDir.source.toDir).toBe('.claude/commands/kiro');
    const doc = plan.find((p) => p.id === 'doc_tpl') as any;
    expect(doc.source.toDir).toBe('.claude');
    expect(doc.source.outFile).toBe('CLAUDE.md');
  });

  it('loads manifest from file and plans', async () => {
    const dir = await mkTmp("ccsdd-manifest-");
    const file = join(dir, 'manifest.json');
    const m = {
      version: 1,
      artifacts: [
        {
          id: 'kiro_meta',
          source: {
            type: 'templateFile' as const,
            from: 'templates/meta/config.tpl.json',
            toDir: '{{KIRO_DIR}}',
          },
        },
      ],
    };
    await writeFile(file, JSON.stringify(m), 'utf8');
    const args = parseArgs(['--kiro-dir', '.work/kiro']);
    const resolved = mergeConfigAndArgs(args, {}, runtimeDarwin);

    const loaded = await loadManifest(file);
    expect(loaded.version).toBe(1);

    const plan = await planFromFile(file, resolved);
    expect(plan).toHaveLength(1);
    const item = plan[0] as any;
    expect(item.source.type).toBe('templateFile');
    expect(item.source.toDir).toBe('.work/kiro');
    expect(item.source.outFile).toBe('config.json');
  });

  it('throws with helpful errors when file missing or invalid', async () => {
    const dir = await mkTmp("ccsdd-manifest-");
    await expect(loadManifest(join(dir, 'missing.json'))).rejects.toThrow(/Manifest not found/);

    const bad = join(dir, 'bad.json');
    await writeFile(bad, '{ invalid', 'utf8');
    await expect(loadManifest(bad)).rejects.toThrow(/Invalid JSON/);
  });
});
