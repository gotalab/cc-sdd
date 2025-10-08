import { parseArgs } from './cli/args.js';
import { mergeConfigAndArgs, type EnvRuntime, type UserConfig } from './cli/config.js';
import { planFromFile } from './manifest/planner.js';
import { formatProcessedArtifacts } from './plan/printer.js';
import { executeProcessedArtifacts } from './plan/executor.js';
import { createRequire } from 'node:module';
import * as readline from 'node:readline/promises';
import path from 'node:path';
import { stat } from 'node:fs/promises';

export type CliIO = {
  log: (msg: string) => void;
  error: (msg: string) => void;
  exit: (code: number) => void;
};

const defaultIO: CliIO = {
  log: (s) => console.log(s),
  error: (s) => console.error(s),
  exit: (c) => process.exit(c),
};

const helpText = `Usage: cc-sdd [options]\n\nOptions:\n  --agent <claude-code|gemini-cli|qwen-code|cursor|codex|github-copilot>  Select agent\n  --claude-code | --gemini-cli | --qwen-code | --cursor | --codex | --github-copilot  Agent alias flags\n  --lang <ja|en|zh-TW|zh|es|pt|de|fr|ru|it|ko|ar>  Language\n  --os <auto|mac|windows|linux>               Target OS (auto uses runtime)\n  --kiro-dir <path>                           Kiro root dir (default .kiro)\n  --overwrite <prompt|skip|force>             Overwrite policy (default: prompt)\n                                              prompt: ask for each file\n                                              skip: never overwrite\n                                              force: always overwrite\n  --backup[=<dir>]                            Enable backup, optional dir\n  --profile <full|minimal>                    Select template profile (default: full)\n  --manifest <path>                           Manifest JSON path for planning\n  --dry-run                                   Print plan only\n  --yes, -y                                   Skip prompts (prompt -> force)\n  -h, --help                                  Show help\n  -v, --version                               Show version\n\nNote: In non-TTY environments, prompt mode falls back to skip.\n`;

const isTTY = (): boolean => {
  return !!(process.stdin.isTTY && process.stdout.isTTY);
};

const createInteractivePrompt = (): ((relPath: string) => Promise<'overwrite' | 'skip'>) => {
  let globalDecision: 'overwrite' | 'skip' | null = null;

  return async (relPath: string): Promise<'overwrite' | 'skip'> => {
    if (globalDecision) return globalDecision;

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    try {
      while (true) {
        const answer = await rl.question(`Overwrite ${relPath}? [y]es/[n]o/[a]ll/[s]kip all: `);
        const choice = answer.toLowerCase().trim();

        switch (choice) {
          case 'y':
          case 'yes':
            return 'overwrite';
          case 'n':
          case 'no':
            return 'skip';
          case 'a':
          case 'all':
            globalDecision = 'overwrite';
            return 'overwrite';
          case 's':
          case 'skip':
            globalDecision = 'skip';
            return 'skip';
          default:
            console.log('Please answer y/n/a/s');
            continue;
        }
      }
    } finally {
      rl.close();
    }
  };
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
    // Resolve version without JSON import assertions for broad Node compatibility
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
    return 0;
  }

  let args;
  try {
    args = parseArgs(argv);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    io.error(`Error: ${msg}`);
    return 1;
  }

  const resolved = mergeConfigAndArgs(args, loadedConfig, runtime);
  // Auto-resolve manifest based on selected agent/profile when not explicitly provided
  const templatesBase = execOpts?.templatesRoot
    ? path.join(execOpts.templatesRoot, 'templates')
    : 'templates';
  let manifestPath = args.manifest;
  if (!manifestPath) {
    const baseDir = path.join(templatesBase, 'manifests');
    const defaultPath = path.join(baseDir, `${resolved.agent}.json`);
    if (args.profile === 'minimal') {
      const minPath = path.join(baseDir, `${resolved.agent}-min.json`);
      try {
        await stat(minPath);
        manifestPath = minPath;
      } catch {
        manifestPath = defaultPath;
      }
    } else {
      manifestPath = defaultPath;
    }
  }

  if (args.dryRun) {
    try {
      const plan = await planFromFile(manifestPath, resolved);
      const text = formatProcessedArtifacts(plan);
      io.log(text);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      io.error(`Error: ${msg}`);
      return 1;
    }
  }

  // Apply path: always execute with resolved manifest when not in --dry-run
  if (!args.dryRun) {
    try {
      const plan = await planFromFile(manifestPath, resolved);
      
      // Handle prompt mode: check TTY and set up onConflict if needed
      let onConflict: ((relPath: string) => Promise<'overwrite' | 'skip'>) | undefined;
      
      if (resolved.effectiveOverwrite === 'prompt') {
        if (isTTY()) {
          onConflict = createInteractivePrompt();
        } else {
          // Non-TTY fallback: warn and skip
          io.log('Warning: prompt mode requires interactive terminal. Files will be skipped.');
          io.log('Use --yes/-y or --overwrite=force to enable overwriting in non-TTY environments.');
          // Keep onConflict undefined to use default 'skip' behavior in executor
        }
      }
      
      const res = await executeProcessedArtifacts(plan, resolved, {
        cwd: execOpts?.cwd,
        templatesRoot: execOpts?.templatesRoot,
        onConflict,
      });
      io.log(`✅ Setup completed: written=${res.written}, skipped=${res.skipped}`);
      
      // Show agent-specific usage instructions
      switch (resolved.agent) {
        case 'claude-code':
          io.log('\n🚀 Try: \x1b[36m/kiro:spec-init [your feature description or what to build]\x1b[0m to get started!');
          break;
        case 'gemini-cli':
          io.log('\n🚀 Try: \x1b[36mgemini /kiro:spec-init [your feature description or what to build]\x1b[0m to get started!');
          break;
        case 'cursor':
          io.log('\x1b[93m\x1b[1mRecommended: Use claude-4-sonnet or later model with thinking mode enabled in the spec workflow (spec-init, spec-requirements, spec-design, spec-tasks)\x1b[0m');
          io.log('\n🚀 Try: Open Cursor panel and use \x1b[36m /kiro/spec-init [your feature description or what to build]\x1b[0m commands to get started!');
          break;
        case 'qwen-code':
          io.log('\n🚀 Try: Use \x1b[36m/kiro:spec-init [your feature description]\x1b[0m to get started!');
          break;
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      io.error(`Error: ${msg}`);
      return 1;
    }
  }

  return 0;
};
