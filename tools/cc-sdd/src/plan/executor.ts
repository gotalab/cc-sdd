import { appendFile, copyFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { ProcessedArtifact } from '../manifest/processor.js';
import type { ResolvedConfig } from '../cli/config.js';
import { buildFileOperations, type FileOperation, type SourceMode } from './fileOperations.js';
import type { InstallCategory } from './categories.js';
import { assertNoSymlinkInPath, ensureDir, fileExists } from '../utils/fs.js';
import { assertPathInsideRoot } from '../utils/pathSafety.js';

const backupIfNeeded = async (target: string, cwd: string, resolved: ResolvedConfig): Promise<void> => {
  if (!resolved.backupEnabled) return;
  if (!(await fileExists(target))) return;
  const rel = path.relative(cwd, target);
  const backupRoot = assertPathInsideRoot(path.resolve(cwd, resolved.backupDir), cwd, 'Backup directory');
  const backupPath = assertPathInsideRoot(path.resolve(backupRoot, rel), backupRoot, 'Backup path');
  await assertNoSymlinkInPath(backupPath, backupRoot);
  await ensureDir(path.dirname(backupPath));
  await copyFile(target, backupPath);
};

export type ConflictDecision = 'overwrite' | 'skip' | 'append';

export type ConflictInfo = {
  relTargetPath: string;
  category: InstallCategory;
  sourceMode: SourceMode;
};

export type ExecOptions = {
  cwd?: string;
  templatesRoot?: string;
  log?: (msg: string) => void;
  onConflict?: (info: ConflictInfo) => Promise<ConflictDecision> | ConflictDecision;
  operations?: FileOperation[];
  categoryPolicies?: Partial<Record<InstallCategory, CategoryPolicy>>;
};

export type CategoryPolicy = 'inherit' | 'overwrite' | 'skip' | 'append';

const resolveCategoryPolicy = (
  category: InstallCategory,
  policies: Partial<Record<InstallCategory, CategoryPolicy>> | undefined,
): CategoryPolicy => {
  return policies?.[category] ?? 'inherit';
};

const appendContent = async (target: string, payload: string): Promise<void> => {
  const normalized = payload.endsWith('\n') ? payload : `${payload}\n`;
  const separator = '\n\n';
  await appendFile(target, (await fileExists(target)) ? `${separator}${normalized}` : normalized, 'utf8');
};

const canAppend = (mode: SourceMode): boolean => {
  return mode !== 'template-json';
};

const ensureString = async (content: string | Buffer): Promise<string> => {
  if (typeof content === 'string') return content;
  return content.toString('utf8');
};

const handleWrite = async (
  op: FileOperation,
  content: string | Buffer,
  cwd: string,
  resolved: ResolvedConfig,
): Promise<void> => {
  const safeDest = assertPathInsideRoot(op.destAbs, cwd, 'Destination path');
  await assertNoSymlinkInPath(safeDest, cwd);
  await backupIfNeeded(safeDest, cwd, resolved);
  await ensureDir(path.dirname(safeDest));
  if (typeof content === 'string') {
    await writeFile(safeDest, content, 'utf8');
  } else {
    await writeFile(safeDest, content);
  }
};

const handleAppend = async (
  op: FileOperation,
  content: string | Buffer,
  cwd: string,
  resolved: ResolvedConfig,
  opts: ExecOptions,
): Promise<boolean> => {
  if (!canAppend(op.sourceMode)) {
    opts.log?.(`Append not supported for ${op.relTarget} (non-text content). Skipping.`);
    return false;
  }
  const safeDest = assertPathInsideRoot(op.destAbs, cwd, 'Destination path');
  await assertNoSymlinkInPath(safeDest, cwd);
  await ensureDir(path.dirname(safeDest));
  if (!(await fileExists(safeDest))) {
    await handleWrite(op, content, cwd, resolved);
    return true;
  }
  const text = await ensureString(content);
  await appendContent(safeDest, text);
  return true;
};

const resolveAction = async (
  op: FileOperation,
  exists: boolean,
  resolved: ResolvedConfig,
  opts: ExecOptions,
): Promise<'write' | 'skip' | 'append'> => {
  const categoryPolicy = resolveCategoryPolicy(op.category, opts.categoryPolicies);
  const effective = resolved.effectiveOverwrite;

  if (!exists) {
    if (categoryPolicy === 'skip') return 'skip';
    if (categoryPolicy === 'append') return 'write';
    return 'write';
  }

  switch (categoryPolicy) {
    case 'skip':
      return 'skip';
    case 'overwrite':
      return 'write';
    case 'append':
      return 'append';
    default:
  }

  if (effective === 'skip') return 'skip';
  if (effective === 'force') return 'write';

  const decision = await opts.onConflict?.({
    relTargetPath: op.relTarget,
    category: op.category,
    sourceMode: op.sourceMode,
  });
  if (!decision || decision === 'skip') return 'skip';
  if (decision === 'append') return 'append';
  return 'write';
};

export const executeProcessedArtifacts = async (
  items: ProcessedArtifact[],
  resolved: ResolvedConfig,
  opts: ExecOptions = {},
): Promise<{ written: number; skipped: number }> => {
  const cwd = opts.cwd ?? process.cwd();
  const operations = opts.operations ?? (await buildFileOperations(items, resolved, opts));
  let written = 0;
  let skipped = 0;

  for (const op of operations) {
    const exists = await fileExists(op.destAbs);
    let action = await resolveAction(op, exists, resolved, opts);

    if (action === 'append' && !canAppend(op.sourceMode)) {
      opts.log?.(`Append not supported for ${op.relTarget} (non-text content). Overwriting instead.`);
      action = 'write';
    }

    if (action === 'skip') {
      skipped++;
      continue;
    }

    const rendered = await op.render();

    if (action === 'append') {
      const success = await handleAppend(op, rendered, cwd, resolved, opts);
      if (success) written++; else skipped++;
      continue;
    }

    await handleWrite(op, rendered, cwd, resolved);
    written++;
  }

  return { written, skipped };
};
