import { describe, it, expect } from 'vitest';
import { executeProcessedArtifacts } from '../src/plan/executor.js';
import type { ConflictInfo } from '../src/plan/executor.js';
import type { ProcessedArtifact } from '../src/manifest/processor.js';
import { mkdtemp, mkdir, writeFile, readFile, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { parseArgs } from '../src/cli/args.js';
import { mergeConfigAndArgs } from '../src/cli/config.js';

const runtimeDarwin = { platform: 'darwin' } as const;
const mkTmp = async () => mkdtemp(join(tmpdir(), 'ccsdd-exec-'));

const baseResolved = () => mergeConfigAndArgs(parseArgs([]), {}, runtimeDarwin);

const fileContent = async (p: string) => (await readFile(p, 'utf8'));
const exists = async (p: string) => {
  try { await stat(p); return true; } catch { return false; }
};

describe('plan executor', () => {
  it('writes templateFile markdown with placeholders', async () => {
    const templatesRoot = await mkTmp();
    const cwd = await mkTmp();
    const tpl = join(templatesRoot, 'doc.tpl.md');
    await writeFile(tpl, '# Agent: {{AGENT}}', 'utf8');

    const items: ProcessedArtifact[] = [
      { id: 'doc', source: { type: 'templateFile', from: 'doc.tpl.md', toDir: 'out', outFile: 'README.md' } },
    ];

    const resolved = baseResolved();
    const res = await executeProcessedArtifacts(items, resolved, { cwd, templatesRoot });
    expect(res.written).toBe(1);
    const out = join(cwd, 'out/README.md');
    expect(await exists(out)).toBe(true);
    expect(await fileContent(out)).toMatch(/Agent: claude-code/);
  });

  it('writes templateFile JSON with placeholders and pretty format', async () => {
    const templatesRoot = await mkTmp();
    const cwd = await mkTmp();
    const tpl = join(templatesRoot, 'cfg.tpl.json');
    await writeFile(tpl, '{"agent":"{{AGENT}}"}', 'utf8');

    const items: ProcessedArtifact[] = [
      { id: 'cfg', source: { type: 'templateFile', from: 'cfg.tpl.json', toDir: 'out', outFile: 'config.json' } },
    ];

    const resolved = baseResolved();
    const res = await executeProcessedArtifacts(items, resolved, { cwd, templatesRoot });
    expect(res.written).toBe(1);
    const out = join(cwd, 'out/config.json');
    const content = await fileContent(out);
    expect(JSON.parse(content)).toEqual({ agent: 'claude-code' });
    expect(content.endsWith('\n')).toBe(true);
  });

  it('copies staticDir recursively', async () => {
    const templatesRoot = await mkTmp();
    const cwd = await mkTmp();
    await mkdir(join(templatesRoot, 'static/sub'), { recursive: true });
    await writeFile(join(templatesRoot, 'static/a.txt'), 'A', 'utf8');
    await writeFile(join(templatesRoot, 'static/sub/b.txt'), 'B', 'utf8');

    const items: ProcessedArtifact[] = [
      { id: 's', source: { type: 'staticDir', from: 'static', toDir: 'out/static' } },
    ];

    const resolved = baseResolved();
    const res = await executeProcessedArtifacts(items, resolved, { cwd, templatesRoot });
    expect(res.written).toBe(2);
    expect(await fileContent(join(cwd, 'out/static/a.txt'))).toBe('A');
    expect(await fileContent(join(cwd, 'out/static/sub/b.txt'))).toBe('B');
  });

  it('renders templateDir and derives output filenames', async () => {
    const templatesRoot = await mkTmp();
    const cwd = await mkTmp();
    await mkdir(join(templatesRoot, 'tdir'), { recursive: true });
    await writeFile(join(templatesRoot, 'tdir/a.tpl.md'), 'Hello {{AGENT}}', 'utf8');
    await writeFile(join(templatesRoot, 'tdir/b.tpl.json'), '{"x":"{{AGENT}}"}', 'utf8');
    await writeFile(join(templatesRoot, 'tdir/c.txt'), 'plain', 'utf8');

    const items: ProcessedArtifact[] = [
      { id: 'd', source: { type: 'templateDir', fromDir: 'tdir', toDir: 'out' } },
    ];

    const resolved = baseResolved();
    const res = await executeProcessedArtifacts(items, resolved, { cwd, templatesRoot });
    expect(res.written).toBe(3);
    expect(await fileContent(join(cwd, 'out/a.md'))).toMatch(/Hello claude-code/);
    expect(JSON.parse(await fileContent(join(cwd, 'out/b.json')))).toEqual({ x: 'claude-code' });
    expect(await fileContent(join(cwd, 'out/c.txt'))).toBe('plain');
  });

  it('skips when effectiveOverwrite is skip', async () => {
    const templatesRoot = await mkTmp();
    const cwd = await mkTmp();
    const out = join(cwd, 'out/file.txt');
    await mkdir(dirname(out), { recursive: true });
    await writeFile(out, 'OLD', 'utf8');
    await writeFile(join(templatesRoot, 'file.txt'), 'NEW', 'utf8');

    const items: ProcessedArtifact[] = [
      { id: 'f', source: { type: 'staticDir', from: '.', toDir: 'out' } },
    ];

    const resolved = mergeConfigAndArgs(parseArgs(['--overwrite', 'skip']), {}, runtimeDarwin);
    const res = await executeProcessedArtifacts(items, resolved, { cwd, templatesRoot });
    expect(res.skipped).toBeGreaterThan(0);
    expect(await fileContent(out)).toBe('OLD');
  });

  it('overwrites when effectiveOverwrite is force (via --yes + prompt)', async () => {
    const templatesRoot = await mkTmp();
    const cwd = await mkTmp();
    const out = join(cwd, 'out/file.txt');
    await mkdir(dirname(out), { recursive: true });
    await writeFile(out, 'OLD', 'utf8');
    await writeFile(join(templatesRoot, 'file.txt'), 'NEW', 'utf8');

    const items: ProcessedArtifact[] = [
      { id: 'f', source: { type: 'staticDir', from: '.', toDir: 'out' } },
    ];

    const resolved = mergeConfigAndArgs(parseArgs(['--yes']), {}, runtimeDarwin); // yes + prompt => force
    const res = await executeProcessedArtifacts(items, resolved, { cwd, templatesRoot });
    expect(res.written).toBeGreaterThan(0);
    expect(await fileContent(out)).toBe('NEW');
  });

  it('backs up and overwrites when backup enabled and overwrite force', async () => {
    const templatesRoot = await mkTmp();
    const cwd = await mkTmp();
    const out = join(cwd, 'out/file.txt');
    await mkdir(dirname(out), { recursive: true });
    await writeFile(out, 'OLD', 'utf8');
    await writeFile(join(templatesRoot, 'file.txt'), 'NEW', 'utf8');

    const items: ProcessedArtifact[] = [
      { id: 'f', source: { type: 'staticDir', from: '.', toDir: 'out' } },
    ];

    const resolved = mergeConfigAndArgs(parseArgs(['--backup', '--overwrite', 'force']), {}, runtimeDarwin);
    const res = await executeProcessedArtifacts(items, resolved, { cwd, templatesRoot });
    expect(res.written).toBeGreaterThan(0);
    expect(await fileContent(out)).toBe('NEW');
    const backup = join(cwd, resolved.backupDir, 'out/file.txt');
    expect(await exists(backup)).toBe(true);
    expect(await fileContent(backup)).toBe('OLD');
  });

  describe('onConflict callback in prompt mode', () => {
    it('calls onConflict when file exists and effectiveOverwrite is prompt', async () => {
      const templatesRoot = await mkTmp();
      const cwd = await mkTmp();
      const out = join(cwd, 'out/file.txt');
      await mkdir(dirname(out), { recursive: true });
      await writeFile(out, 'OLD', 'utf8');
      await writeFile(join(templatesRoot, 'file.txt'), 'NEW', 'utf8');

      const items: ProcessedArtifact[] = [
        { id: 'f', source: { type: 'staticDir', from: '.', toDir: 'out' } },
      ];

      const resolved = mergeConfigAndArgs(parseArgs(['--overwrite', 'prompt']), {}, runtimeDarwin);
      let conflictPath: string | undefined;
      const onConflict = async ({ relTargetPath }: ConflictInfo) => {
        conflictPath = relTargetPath;
        return 'overwrite' as const;
      };

      const res = await executeProcessedArtifacts(items, resolved, { cwd, templatesRoot, onConflict });
      expect(conflictPath).toBe('out/file.txt');
      expect(res.written).toBeGreaterThan(0);
      expect(await fileContent(out)).toBe('NEW');
    });

    it('respects onConflict "skip" decision', async () => {
      const templatesRoot = await mkTmp();
      const cwd = await mkTmp();
      const out = join(cwd, 'out/file.txt');
      await mkdir(dirname(out), { recursive: true });
      await writeFile(out, 'OLD', 'utf8');
      await writeFile(join(templatesRoot, 'file.txt'), 'NEW', 'utf8');

      const items: ProcessedArtifact[] = [
        { id: 'f', source: { type: 'staticDir', from: '.', toDir: 'out' } },
      ];

      const resolved = mergeConfigAndArgs(parseArgs(['--overwrite', 'prompt']), {}, runtimeDarwin);
      const onConflict = async (_info: ConflictInfo) => 'skip' as const;

      const res = await executeProcessedArtifacts(items, resolved, { cwd, templatesRoot, onConflict });
      expect(res.skipped).toBeGreaterThan(0);
      expect(await fileContent(out)).toBe('OLD');
    });

    it('falls back to skip when onConflict undefined in prompt mode', async () => {
      const templatesRoot = await mkTmp();
      const cwd = await mkTmp();
      const out = join(cwd, 'out/file.txt');
      await mkdir(dirname(out), { recursive: true });
      await writeFile(out, 'OLD', 'utf8');
      await writeFile(join(templatesRoot, 'file.txt'), 'NEW', 'utf8');

      const items: ProcessedArtifact[] = [
        { id: 'f', source: { type: 'staticDir', from: '.', toDir: 'out' } },
      ];

      const resolved = mergeConfigAndArgs(parseArgs(['--overwrite', 'prompt']), {}, runtimeDarwin);
      // No onConflict provided

      const res = await executeProcessedArtifacts(items, resolved, { cwd, templatesRoot });
      expect(res.skipped).toBeGreaterThan(0);
      expect(await fileContent(out)).toBe('OLD');
    });

    it('works with templateFile in prompt mode', async () => {
      const templatesRoot = await mkTmp();
      const cwd = await mkTmp();
      const tpl = join(templatesRoot, 'doc.tpl.md');
      await writeFile(tpl, '# New: {{AGENT}}', 'utf8');
      
      const out = join(cwd, 'out/README.md');
      await mkdir(dirname(out), { recursive: true });
      await writeFile(out, '# Old content', 'utf8');

      const items: ProcessedArtifact[] = [
        { id: 'doc', source: { type: 'templateFile', from: 'doc.tpl.md', toDir: 'out', outFile: 'README.md' } },
      ];

      const resolved = mergeConfigAndArgs(parseArgs(['--overwrite', 'prompt']), {}, runtimeDarwin);
      const onConflict = async (_info: ConflictInfo) => 'overwrite' as const;

      const res = await executeProcessedArtifacts(items, resolved, { cwd, templatesRoot, onConflict });
      expect(res.written).toBe(1);
      expect(await fileContent(out)).toMatch(/New: claude-code/);
    });

    it('creates new files automatically without prompts in prompt mode', async () => {
      const templatesRoot = await mkTmp();
      const cwd = await mkTmp();
      const tpl = join(templatesRoot, 'new-file.tpl.md');
      await writeFile(tpl, '# Brand New: {{AGENT}}', 'utf8');

      const items: ProcessedArtifact[] = [
        { id: 'newdoc', source: { type: 'templateFile', from: 'new-file.tpl.md', toDir: 'out', outFile: 'new-file.md' } },
      ];

      const resolved = mergeConfigAndArgs(parseArgs(['--overwrite', 'prompt']), {}, runtimeDarwin);
      let onConflictCalled = false;
      const onConflict = async (_info: ConflictInfo) => {
        onConflictCalled = true;
        return 'overwrite' as const;
      };

      const res = await executeProcessedArtifacts(items, resolved, { cwd, templatesRoot, onConflict });
      
      // Should create new file without calling onConflict
      expect(onConflictCalled).toBe(false);
      expect(res.written).toBe(1);
      expect(res.skipped).toBe(0);
      
      const out = join(cwd, 'out/new-file.md');
      expect(await exists(out)).toBe(true);
      expect(await fileContent(out)).toMatch(/Brand New: claude-code/);
    });
  });
});
