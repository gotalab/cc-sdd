import type { ResolvedConfig } from './config.js';
import type { CliIO } from './io.js';
import type { FileOperation } from '../plan/fileOperations.js';
import type { InstallCategory } from '../plan/categories.js';
import { categoryDescriptions, categoryLabels } from '../plan/categories.js';
import { colors, formatHeading, formatWarning } from './ui/colors.js';
import { isInteractive, promptChoice, promptConfirm } from './ui/prompt.js';
import { fileExists } from '../utils/fs.js';

export type CategorySummary = {
  category: InstallCategory;
  label: string;
  total: number;
  existing: number;
  example?: string;
};

export type CategoryPolicyMap = Partial<Record<InstallCategory, 'inherit' | 'overwrite' | 'skip' | 'append'>>;

export const summarizeCategories = async (operations: FileOperation[]): Promise<CategorySummary[]> => {
  const byCategory = new Map<InstallCategory, CategorySummary>();

  for (const op of operations) {
    const existing = await fileExists(op.destAbs);
    const current = byCategory.get(op.category) ?? {
      category: op.category,
      label: categoryLabels[op.category] ?? op.category,
      total: 0,
      existing: 0,
      example: op.relTarget,
    };
    current.total += 1;
    if (existing) current.existing += 1;
    if (!current.example) current.example = op.relTarget;
    byCategory.set(op.category, current);
  }

  return Array.from(byCategory.values()).sort((a, b) => a.label.localeCompare(b.label));
};

const hasConflicts = (summary: CategorySummary): boolean => summary.existing > 0;

const summarizeStatus = (summary: CategorySummary): string => {
  if (summary.existing > 0) {
    return colors.yellow(`updates detected (${summary.existing} existing)`);
  }
  return colors.green('new');
};

export const printSummary = (summaries: CategorySummary[], resolved: ResolvedConfig, io: CliIO): void => {
  if (!summaries.length) return;
  io.log(formatHeading('Planned changes:'));
  summaries.forEach((summary) => {
    const location = categoryDescriptions(summary.category, resolved);
    const detail = location ? ` (${location})` : '';
    io.log(`  • ${colors.cyan(`${summary.label}${detail}`)} — ${summarizeStatus(summary)} (${summary.total} file(s))`);
  });
  io.log('');
};

export const determineCategoryPolicies = async (
  summaries: CategorySummary[],
  resolved: ResolvedConfig,
  io: CliIO,
): Promise<CategoryPolicyMap> => {
  const policies: CategoryPolicyMap = {};

  const commands = summaries.find((s) => s.category === 'commands');
  const settings = summaries.find((s) => s.category === 'settings');
  const projectMemory = summaries.find((s) => s.category === 'project-memory');

  const interactive = isInteractive();
  const overwriteMode = resolved.effectiveOverwrite;

  const applyDefault = (value: 'overwrite' | 'skip') => {
    if (commands) policies.commands = value;
    if (settings) policies.settings = value;
    if (projectMemory) policies['project-memory'] = value === 'overwrite' ? 'overwrite' : 'skip';
  };

  if (overwriteMode === 'force') {
    applyDefault('overwrite');
    return policies;
  }
  if (overwriteMode === 'skip') {
    applyDefault('skip');
    return policies;
  }

  if (!interactive) {
    io.log(
      formatWarning(
        'Non-interactive environment detected. Existing files will be kept. Use --yes or --overwrite=force to overwrite.',
      ),
    );
    return policies;
  }

  // Commands (prompt once)
  if (commands && hasConflicts(commands)) {
    const confirm = await promptConfirm(
      `Update commands in ${categoryDescriptions('commands', resolved)}? (recommended: Yes)`,
      true,
    );
    policies.commands = confirm ? 'overwrite' : 'skip';
  }

  // Settings templates/rules
  if (settings && hasConflicts(settings)) {
    const confirm = await promptConfirm(
      `Update settings templates and rules in ${categoryDescriptions('settings', resolved)}?`,
      true,
    );
    policies.settings = confirm ? 'overwrite' : 'skip';
  }

  // Project memory document
  if (projectMemory && hasConflicts(projectMemory)) {
    const docName = categoryDescriptions('project-memory', resolved);
    const choice = await promptChoice<'overwrite' | 'append' | 'skip'>(
      `Project Memory document (${docName}) already exists. How should we apply updates? (recommended: Overwrite)`,
      [
        {
          value: 'overwrite',
          label: `Overwrite ${docName}`,
          description: 'Replace the document with the latest template (previous content will be backed up if enabled).',
        },
        {
          value: 'append',
          label: `Append updates to ${docName}`,
          description: 'Keep your existing notes and add new template sections after them.',
        },
        {
          value: 'skip',
          label: `Keep current ${docName}`,
          description: 'Do not change the Project Memory document.',
        },
      ],
      0,
    );
    policies['project-memory'] = choice;
  }

  return policies;
};
