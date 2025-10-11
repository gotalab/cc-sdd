import path from 'node:path';
import { stat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { agentList, getAgentDefinition } from './agents/registry.js';
import { parseArgs } from './cli/args.js';
import { mergeConfigAndArgs, type EnvRuntime, type UserConfig } from './cli/config.js';
import { planFromFile } from './manifest/planner.js';
import { formatProcessedArtifacts } from './plan/printer.js';
import {
  executeProcessedArtifacts,
  type CategoryPolicy,
  type ConflictDecision,
  type ConflictInfo,
} from './plan/executor.js';
import { buildFileOperations, type FileOperation } from './plan/fileOperations.js';
import { ensureAgentSelection, printCompletionGuide } from './cli/agents.js';
import { determineCategoryPolicies, printSummary, summarizeCategories, type CategoryPolicyMap } from './cli/policies.js';
import { defaultIO, type CliIO } from './cli/io.js';
import { colors, formatError, formatHeading, formatSuccess, formatWarning } from './cli/ui/colors.js';
import { isInteractive, promptChoice, promptConfirm } from './cli/ui/prompt.js';

const agentKeys = agentList;
const aliasFlags = Array.from(new Set(agentKeys.flatMap((key) => getAgentDefinition(key).aliasFlags)));

const agentAliasLine = aliasFlags.length > 0 ? `  ${aliasFlags.join(' | ')}  Agent alias flags\n` : '';

const helpText = `Usage: cc-sdd [options]

Options:
  --agent <${agentKeys.join('|')}>  Select agent
${agentAliasLine}  --lang <ja|en|zh-TW|zh|es|pt|de|fr|ru|it|ko|ar>  Language
  --os <auto|mac|windows|linux>               Target OS (auto uses runtime)
  --kiro-dir <path>                           Kiro root dir (default .kiro)
  --overwrite <prompt|skip|force>             Overwrite policy (default: prompt)
                                              prompt: ask for each file
                                              skip: never overwrite
                                              force: always overwrite
  --backup[=<dir>]                            Enable backup, optional dir
  --profile <full|minimal>                    Select template profile (default: full)
  --manifest <path>                           Manifest JSON path for planning
  --dry-run                                   Print plan only
  --yes, -y                                   Skip prompts (prompt -> force)
  -h, --help                                  Show help
  -v, --version                               Show version

Note: In non-TTY environments, prompt mode falls back to skip.`;

const resolveManifestPath = async (
  resolvedAgent: string,
  argsProfile: 'full' | 'minimal' | undefined,
  manifestArg: string | undefined,
  templatesBase: string,
): Promise<string> => {
  if (manifestArg) return manifestArg;
  const baseDir = path.join(templatesBase, 'manifests');
  const defaultPath = path.join(baseDir, `${resolvedAgent}.json`);
  if (argsProfile === 'minimal') {
    const minimal = path.join(baseDir, `${resolvedAgent}-min.json`);
    try {
      await stat(minimal);
      return minimal;
    } catch {
      return defaultPath;
    }
  }
  return defaultPath;
};

const createConflictHandler = (
  summaries: Awaited<ReturnType<typeof summarizeCategories>>,
  resolvedOverwrite: 'prompt' | 'skip' | 'force',
): ((info: ConflictInfo) => Promise<ConflictDecision>) | undefined => {
  if (!isInteractive()) return undefined;

  const remainingExisting = new Map<string, number>(
    summaries.map((summary) => [summary.category, summary.existing]),
  );
  const stickyDecisions = new Map<string, ConflictDecision>();

  return async (info: ConflictInfo): Promise<ConflictDecision> => {
    const cached = stickyDecisions.get(info.category);
    if (cached) return cached;

    const remaining = remainingExisting.get(info.category) ?? 1;
    remainingExisting.set(info.category, Math.max(remaining - 1, 0));

    const choices: { value: ConflictDecision; label: string; description?: string }[] = [
      { value: 'overwrite', label: 'Overwrite this file', description: 'Replace with the latest template content.' },
      { value: 'skip', label: 'Keep existing file', description: 'Leave the current file unchanged.' },
    ];

    if (info.category === 'project-memory' && info.sourceMode !== 'template-json') {
      choices.splice(1, 0, {
        value: 'append',
        label: 'Append template content',
        description: 'Add new sections after the existing project memory file.',
      });
    }

    const promptMessage = `Update ${info.relTargetPath}?`;
    const defaultIndex = resolvedOverwrite === 'force' ? 0 : 1;
    const decision = await promptChoice(promptMessage, choices, Math.min(defaultIndex, choices.length - 1));

    if (remaining > 1) {
      const applyToRest = await promptConfirm('Apply this choice to remaining files in this category?', true);
      if (applyToRest) stickyDecisions.set(info.category, decision);
    }

    return decision;
  };
};

const showVersion = (io: CliIO): void => {
  let version = 'dev';
  try {
    const require = createRequire(import.meta.url);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pkg = require('../package.json');
    version = pkg?.version ?? version;
  } catch {
    // ignore
  }
  io.log(`cc-sdd v${version}`);
};

const handleDryRun = async (
  manifestPath: string,
  resolvedConfig: ReturnType<typeof mergeConfigAndArgs>,
  io: CliIO,
  execOpts?: { cwd?: string; templatesRoot?: string },
): Promise<number> => {
  try {
    const plan = await planFromFile(manifestPath, resolvedConfig);
    const operations = await buildFileOperations(plan, resolvedConfig, execOpts);
    const summaries = await summarizeCategories(operations);
    printSummary(summaries, resolvedConfig, io);
    io.log(formatHeading('Artifact details:'));
    io.log(formatProcessedArtifacts(plan));
    return 0;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    io.error(formatError(`Error: ${msg}`));
    return 1;
  }
};

const runPlanExecution = async (
  manifestPath: string,
  resolvedConfig: ReturnType<typeof mergeConfigAndArgs>,
  io: CliIO,
  execOpts?: { cwd?: string; templatesRoot?: string },
): Promise<number> => {
  try {
    const plan = await planFromFile(manifestPath, resolvedConfig);
    const operations = await buildFileOperations(plan, resolvedConfig, execOpts);
    const summaries = await summarizeCategories(operations);
    printSummary(summaries, resolvedConfig, io);

    const categoryPolicies: CategoryPolicyMap =
      resolvedConfig.effectiveOverwrite === 'force'
        ? {}
        : await determineCategoryPolicies(summaries, resolvedConfig, io);

    const conflictHandler = createConflictHandler(summaries, resolvedConfig.effectiveOverwrite);
    if (!conflictHandler && resolvedConfig.effectiveOverwrite === 'prompt') {
      io.log(formatWarning('Prompt mode unavailable; existing files will be skipped. Use --yes or --overwrite=force.'));
    }

    const result = await executeProcessedArtifacts(plan, resolvedConfig, {
      cwd: execOpts?.cwd,
      templatesRoot: execOpts?.templatesRoot,
      operations,
      categoryPolicies,
      onConflict: conflictHandler,
      log: (message) => io.log(colors.dim(message)),
    });

    io.log(formatSuccess(`✅ Setup completed: written=${result.written}, skipped=${result.skipped}`));
    printCompletionGuide(resolvedConfig.agent, io);
    return 0;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    io.error(formatError(`Error: ${msg}`));
    return 1;
  }
};

export const runCli = async (
  argv: string[],
  runtime: EnvRuntime = { platform: process.platform, env: process.env },
  io: CliIO = defaultIO,
  loadedConfig: UserConfig = {},
  execOpts?: { cwd?: string; templatesRoot?: string },
): Promise<number> => {
  if (argv.includes('--help') || argv.includes('-h')) {
    io.log(helpText);
    return 0;
  }
  if (argv.includes('--version') || argv.includes('-v')) {
    showVersion(io);
    return 0;
  }

  let parsedArgs;
  try {
    parsedArgs = parseArgs(argv);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    io.error(formatError(`Error: ${msg}`));
    return 1;
  }

  parsedArgs.agent = await ensureAgentSelection(parsedArgs.agent, io);

  const resolved = mergeConfigAndArgs(parsedArgs, loadedConfig, runtime);

  const templatesBase = execOpts?.templatesRoot ? path.join(execOpts.templatesRoot, 'templates') : 'templates';
  const manifestPath = await resolveManifestPath(resolved.agent, parsedArgs.profile, parsedArgs.manifest, templatesBase);

  if (parsedArgs.dryRun) {
    return handleDryRun(manifestPath, resolved, io, execOpts);
  }

  return runPlanExecution(manifestPath, resolved, io, execOpts);
};
