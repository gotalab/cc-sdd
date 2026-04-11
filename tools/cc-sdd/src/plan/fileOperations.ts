import path from 'node:path';
import { readFile, readdir } from 'node:fs/promises';
import type { ProcessedArtifact } from '../manifest/processor.js';
import type { ResolvedConfig } from '../cli/config.js';
import { contextFromResolved } from '../template/fromResolved.js';
import { renderJsonTemplate, renderTemplateString } from '../template/renderer.js';
import { categorizeTarget, type InstallCategory } from './categories.js';
import { getAgentDefinition } from '../agents/registry.js';
import { parseSharedRules, buildSharedRuleOperations } from './sharedRules.js';
import { assertPathInsideRoot, resolveRelativePathInsideRoot } from '../utils/pathSafety.js';

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
      const srcDir = resolveRelativePathInsideRoot(templatesRoot, art.source.from, `Artifact ${art.id} source path`);
      const destDir = resolveRelativePathInsideRoot(cwd, art.source.toDir, `Artifact ${art.id} destination path`);
      const files = await walkDir(srcDir);
      for (const src of files) {
        const rel = path.relative(srcDir, src);
        const destAbs = assertPathInsideRoot(path.join(destDir, rel), cwd, `Artifact ${art.id} destination file`);
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
      const srcAbs = resolveRelativePathInsideRoot(templatesRoot, art.source.from, `Artifact ${art.id} source path`);
      const destDir = resolveRelativePathInsideRoot(cwd, art.source.toDir, `Artifact ${art.id} destination path`);
      const destAbs = assertPathInsideRoot(path.join(destDir, art.source.outFile), cwd, `Artifact ${art.id} destination file`);
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
                const fallbackAbs = resolveRelativePathInsideRoot(
                  path.resolve(templatesRoot, '../..'),
                  fallbackRel,
                  `Artifact ${art.id} fallback template path`,
                );
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
      const srcDir = resolveRelativePathInsideRoot(templatesRoot, art.source.fromDir, `Artifact ${art.id} source path`);
      const destDir = resolveRelativePathInsideRoot(cwd, art.source.toDir, `Artifact ${art.id} destination path`);
      const files = await walkDir(srcDir);

      // Collect shared-rules declarations from SKILL.md files
      const sharedRulesBySkill = new Map<string, string[]>();
      for (const src of files) {
        if (path.basename(src) === 'SKILL.md') {
          const content = await readFile(src, 'utf8');
          const rules = parseSharedRules(content);
          if (rules.length > 0) {
            const skillDir = path.dirname(src);
            const skillRel = path.relative(srcDir, skillDir);
            sharedRulesBySkill.set(skillRel, rules);
          }
        }
      }

      for (const src of files) {
        const rel = path.relative(srcDir, src);

        // Skip physical rules/ files for skills that declare shared-rules
        if (sharedRulesBySkill.size > 0) {
          const parts = rel.split(path.sep);
          const rulesIdx = parts.indexOf('rules');
          if (rulesIdx >= 0) {
            const skillRel = parts.slice(0, rulesIdx).join(path.sep);
            if (sharedRulesBySkill.has(skillRel)) continue;
          }
        }

        const { outName, mode } = transformTemplateOutput(rel);
        const destAbs = assertPathInsideRoot(path.join(destDir, outName), cwd, `Artifact ${art.id} destination file`);
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

      // Append shared rule operations for each skill
      for (const [skillRel, ruleNames] of sharedRulesBySkill) {
        const skillDestDir = path.join(destDir, skillRel);
        const sharedOps = await buildSharedRuleOperations(
          ruleNames, skillDestDir, templatesRoot, art.id, cwd, resolved, ctx,
        );
        operations.push(...sharedOps);
      }

      continue;
    }
  }

  return operations.sort((a, b) => a.relTarget.localeCompare(b.relTarget));
};
