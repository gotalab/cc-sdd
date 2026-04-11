import path from 'node:path';
import { readFile } from 'node:fs/promises';
import type { ResolvedConfig } from '../cli/config.js';
import type { TemplateContext } from '../template/context.js';
import { renderTemplateString } from '../template/renderer.js';
import { categorizeTarget } from './categories.js';
import type { FileOperation } from './fileOperations.js';
import { assertPathInsideRoot, resolveRelativePathInsideRoot } from '../utils/pathSafety.js';

export const SHARED_RULES_DIR = 'templates/shared/settings/rules';

export const parseSharedRules = (content: string): string[] => {
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fmMatch) return [];

  const frontmatter = fmMatch[1];
  const metadataMatch = frontmatter.match(/^metadata:\s*$/m);
  if (!metadataMatch) return [];

  const afterMetadata = frontmatter.slice(metadataMatch.index! + metadataMatch[0].length);
  const lines = afterMetadata.split('\n');

  for (const line of lines) {
    if (/^\S/.test(line)) break;
    const rulesMatch = line.match(/^\s+shared-rules:\s*"?([^"]*)"?\s*$/);
    if (rulesMatch) {
      const value = rulesMatch[1].trim();
      if (!value) return [];
      return value.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }

  return [];
};

export const buildSharedRuleOperations = async (
  ruleNames: string[],
  skillDestDir: string,
  templatesRoot: string,
  artifactId: string,
  cwd: string,
  resolved: ResolvedConfig,
  ctx: TemplateContext,
): Promise<FileOperation[]> => {
  const operations: FileOperation[] = [];
  const sharedRulesRoot = path.resolve(templatesRoot, SHARED_RULES_DIR);

  for (const ruleName of ruleNames) {
    if (!/^[A-Za-z0-9._-]+\.md$/.test(ruleName)) {
      throw new Error(`Invalid shared rule name: ${ruleName}`);
    }
    const srcAbs = resolveRelativePathInsideRoot(sharedRulesRoot, ruleName, `Shared rule "${ruleName}" source path`);
    const rulesDestDir = path.join(skillDestDir, 'rules');
    const destAbs = assertPathInsideRoot(
      path.join(rulesDestDir, ruleName),
      rulesDestDir,
      `Shared rule "${ruleName}" destination path`,
    );
    const relTarget = path.relative(cwd, destAbs);
    const category = categorizeTarget(destAbs, cwd, resolved);

    operations.push({
      artifactId,
      srcAbs,
      destAbs,
      relTarget,
      sourceMode: 'template-text',
      category,
      render: async () => {
        const raw = await readFile(srcAbs, 'utf8');
        return renderTemplateString(raw, resolved.agent, ctx);
      },
    });
  }

  return operations;
};
