import path from 'node:path';
import { readFile, readdir } from 'node:fs/promises';
import type { ProcessedArtifact } from '../manifest/processor.js';
import type { ResolvedConfig } from '../cli/config.js';
import { contextFromResolved } from '../template/fromResolved.js';
import { renderJsonTemplate, renderTemplateString } from '../template/renderer.js';
import { categorizeTarget, type InstallCategory } from './categories.js';
import { getAgentDefinition } from '../agents/registry.js';

export type SourceMode = 'static' | 'template-text' | 'template-json';

export type FileOperation = {
  artifactId: string;
  srcAbs: string;
  destAbs: string;
  relTarget: string;
  sourceMode: SourceMode;
  render: () => Promise<string | Buffer>;
  category: InstallCategory;
};

type WalkEntry = {
  path: string;
  isDirectory: boolean;
};

const walkDir = async (dir: string): Promise<string[]> => {
  const out: string[] = [];
  const queue: WalkEntry[] = [{ path: dir, isDirectory: true }];

  while (queue.length) {
    const entry = queue.pop()!;
    if (!entry.isDirectory) {
      out.push(entry.path);
      continue;
    }
    const entries = await readdir(entry.path, { withFileTypes: true });
    for (const child of entries) {
      const full = path.join(entry.path, child.name);
      if (child.isDirectory()) {
        queue.push({ path: full, isDirectory: true });
      } else if (child.isFile()) {
        queue.push({ path: full, isDirectory: false });
      }
    }
  }

  return out.filter((p) => p !== dir);
};

const transformTemplateOutput = (relPath: string): { outName: string; mode: 'json' | 'text' } => {
  const dirName = path.dirname(relPath);
  const base = path.basename(relPath);
  if (base.endsWith('.tpl.json')) {
    const replaced = base.slice(0, -('.tpl.json'.length)) + '.json';
    return { outName: dirName === '.' ? replaced : path.join(dirName, replaced), mode: 'json' };
  }
  if (base.endsWith('.tpl.md')) {
    const replaced = base.slice(0, -('.tpl.md'.length)) + '.md';
    return { outName: dirName === '.' ? replaced : path.join(dirName, replaced), mode: 'text' };
  }
  if (base.endsWith('.tpl.toml')) {
    const replaced = base.slice(0, -('.tpl.toml'.length)) + '.toml';
    return { outName: dirName === '.' ? replaced : path.join(dirName, replaced), mode: 'text' };
  }
  return { outName: relPath, mode: 'text' };
};

const determineModeFromFilename = (filename: string): 'json' | 'text' => {
  if (filename.endsWith('.json')) return 'json';
  return 'text';
};

export type BuildOperationsOptions = {
  cwd?: string;
  templatesRoot?: string;
};

export const buildFileOperations = async (
  artifacts: ProcessedArtifact[],
  resolved: ResolvedConfig,
  opts: BuildOperationsOptions = {},
): Promise<FileOperation[]> => {
  const cwd = opts.cwd ?? process.cwd();
  const templatesRoot = opts.templatesRoot ?? cwd;
  const ctx = contextFromResolved(resolved);
  const operations: FileOperation[] = [];
  const agentDefinition = getAgentDefinition(resolved.agent);

  for (const art of artifacts) {
    if (art.source.type === 'staticDir') {
      const srcDir = path.resolve(templatesRoot, art.source.from);
      const destDir = path.resolve(cwd, art.source.toDir);
      const files = await walkDir(srcDir);
      for (const src of files) {
        const rel = path.relative(srcDir, src);
        const destAbs = path.join(destDir, rel);
        const relTarget = path.relative(cwd, destAbs);
        const category = categorizeTarget(destAbs, cwd, resolved);
        operations.push({
          artifactId: art.id,
          srcAbs: src,
          destAbs,
          relTarget,
          sourceMode: 'static',
          category,
          render: async () => readFile(src),
        });
      }
      continue;
    }

    if (art.source.type === 'templateFile') {
      const srcAbs = path.resolve(templatesRoot, art.source.from);
      const destDir = path.resolve(cwd, art.source.toDir);
      const destAbs = path.join(destDir, art.source.outFile);
      const relTarget = path.relative(cwd, destAbs);
      const category = categorizeTarget(destAbs, cwd, resolved);
      const mode = determineModeFromFilename(art.source.outFile);
      const fallbackRel = agentDefinition.templateFallbacks?.[art.source.outFile];
      operations.push({
        artifactId: art.id,
        srcAbs,
        destAbs,
        relTarget,
        sourceMode: mode === 'json' ? 'template-json' : 'template-text',
        category,
        render: async () => {
          const loadTemplate = async (): Promise<string> => {
            try {
              return await readFile(srcAbs, 'utf8');
            } catch (error) {
              const err = error as NodeJS.ErrnoException;
              if (err?.code === 'ENOENT' && fallbackRel) {
                const fallbackAbs = path.resolve(templatesRoot, fallbackRel);
                return readFile(fallbackAbs, 'utf8');
              }
              throw error;
            }
          };
          const raw = await loadTemplate();
          if (mode === 'json') {
            const obj = renderJsonTemplate(raw, resolved.agent, ctx);
            return JSON.stringify(obj, null, 2) + '\n';
          }
          return renderTemplateString(raw, resolved.agent, ctx);
        },
      });
      continue;
    }

    if (art.source.type === 'templateDir') {
      const srcDir = path.resolve(templatesRoot, art.source.fromDir);
      const destDir = path.resolve(cwd, art.source.toDir);
      const files = await walkDir(srcDir);
      for (const src of files) {
        const rel = path.relative(srcDir, src);
        const { outName, mode } = transformTemplateOutput(rel);
        const destAbs = path.join(destDir, outName);
        const relTarget = path.relative(cwd, destAbs);
        const category = categorizeTarget(destAbs, cwd, resolved);
        operations.push({
          artifactId: art.id,
          srcAbs: src,
          destAbs,
          relTarget,
          sourceMode: mode === 'json' ? 'template-json' : 'template-text',
          category,
          render: async () => {
            const raw = await readFile(src, 'utf8');
            if (mode === 'json') {
              const obj = renderJsonTemplate(raw, resolved.agent, ctx);
              return JSON.stringify(obj, null, 2) + '\n';
            }
            return renderTemplateString(raw, resolved.agent, ctx);
          },
        });
      }
      continue;
    }
  }

  return operations.sort((a, b) => a.relTarget.localeCompare(b.relTarget));
};
