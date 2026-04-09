import { describe, it, expect } from 'vitest';
import { planFromManifest, planFromFile } from '../src/manifest/planner';
import { loadManifest } from '../src/manifest/loader';
import { mergeConfigAndArgs } from '../src/cli/config';
import { parseArgs } from '../src/cli/args';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mkdtemp, writeFile } from 'node:fs/promises';

const runtimeDarwin = { platform: 'darwin' } as const;

const mkTmp = async () => mkdtemp(join(tmpdir(), 'ccsdd-manifest-'));

describe('manifest planner glue', () => {
  it('plans artifacts from in-memory manifest using resolved config context', async () => {
    const args = parseArgs([]); // defaults to claude-code-skills
    const resolved = mergeConfigAndArgs(args, {}, runtimeDarwin);

    const manifest = {
      version: 1,
      artifacts: [
        {
          id: 'skills_dir',
          source: {
            type: 'staticDir' as const,
            from: 'templates/agents/{{AGENT}}/skills',
            toDir: '{{AGENT_COMMANDS_DIR}}',
          },
          when: { agent: ['claude-code-skills'] },
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
    const staticDir = plan.find((p) => p.id === 'skills_dir') as any;
    expect(staticDir.source.from).toBe('templates/agents/claude-code-skills/skills');
    expect(staticDir.source.toDir).toBe('.claude/skills');
    const doc = plan.find((p) => p.id === 'doc_tpl') as any;
    expect(doc.source.toDir).toBe('.claude');
    expect(doc.source.outFile).toBe('CLAUDE.md');
  });

  it('loads manifest from file and plans', async () => {
    const dir = await mkTmp();
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
    const dir = await mkTmp();
    await expect(loadManifest(join(dir, 'missing.json'))).rejects.toThrow(/Manifest not found/);

    const bad = join(dir, 'bad.json');
    await writeFile(bad, '{ invalid', 'utf8');
    await expect(loadManifest(bad)).rejects.toThrow(/Invalid JSON/);
  });
});
