import type { ParsedArgs } from './args.js';
import type { AgentType, AgentLayout, CCSddConfig } from '../resolvers/agentLayout.js';
import { resolveAgentLayout } from '../resolvers/agentLayout.js';
import type { OSType } from '../resolvers/os.js';
import { resolveOs } from '../resolvers/os.js';
import { resolveKiroDir } from '../resolvers/kiroDir.js';

export type OverwritePolicy = 'prompt' | 'skip' | 'force';

export type UserConfig = Partial<{
  version: number;
  agent: AgentType;
  os: 'auto' | OSType;
  resolvedOs: OSType;
  lang:
    | 'ja'
    | 'en'
    | 'zh-TW'
    | 'zh'
    | 'es'
    | 'pt'
    | 'de'
    | 'fr'
    | 'ru'
    | 'it'
    | 'ko'
    | 'ar';
  kiroDir: string;
  overwrite: OverwritePolicy;
  backupDir: string;
  agentLayouts: CCSddConfig['agentLayouts'];
}>;

export type ResolvedConfig = {
  agent: AgentType;
  os: 'auto' | OSType;
  resolvedOs: OSType;
  lang:
    | 'ja'
    | 'en'
    | 'zh-TW'
    | 'zh'
    | 'es'
    | 'pt'
    | 'de'
    | 'fr'
    | 'ru'
    | 'it'
    | 'ko'
    | 'ar';
  kiroDir: string;
  overwrite: OverwritePolicy;
  effectiveOverwrite: OverwritePolicy;
  dryRun: boolean;
  yes: boolean;
  backupEnabled: boolean;
  backupDir: string;
  layout: AgentLayout;
};

const defaults = {
  agent: 'claude-code' as AgentType,
  os: 'auto' as const,
  lang: 'en' as const,
  kiroDir: '.kiro',
  overwrite: 'prompt' as OverwritePolicy,
  backupDir: '.cc-sdd.backup',
};

export type EnvRuntime = { platform?: string; env?: Record<string, string | undefined> };

export const mergeConfigAndArgs = (
  args: ParsedArgs,
  config: UserConfig = {},
  runtime: EnvRuntime = {},
): ResolvedConfig => {
  const agent: AgentType = (args.agent ?? config.agent ?? defaults.agent) as AgentType;
  const osInput: 'auto' | OSType = (args.os ?? config.os ?? defaults.os) as any;
  const resolvedOs = resolveOs(osInput, runtime);
  const lang = (args.lang ?? config.lang ?? defaults.lang) as
    | 'ja'
    | 'en'
    | 'zh-TW'
    | 'zh'
    | 'es'
    | 'pt'
    | 'de'
    | 'fr'
    | 'ru'
    | 'it'
    | 'ko'
    | 'ar';

  const kiroDir = resolveKiroDir({ flag: args.kiroDir, config: config.kiroDir });

  const overwrite: OverwritePolicy = (args.overwrite ?? config.overwrite ?? defaults.overwrite) as OverwritePolicy;
  const yes = !!args.yes;
  const effectiveOverwrite: OverwritePolicy = yes && overwrite === 'prompt' ? 'force' : overwrite;

  const dryRun = !!args.dryRun;

  let backupEnabled = false;
  let backupDir = config.backupDir ?? defaults.backupDir;
  if (typeof args.backup !== 'undefined') {
    backupEnabled = !!args.backup || typeof args.backup === 'string';
    if (typeof args.backup === 'string' && args.backup.trim()) {
      backupDir = args.backup;
    }
  }

  const layout = resolveAgentLayout(agent, { agentLayouts: config.agentLayouts });

  return {
    agent,
    os: osInput,
    resolvedOs,
    lang,
    kiroDir,
    overwrite,
    effectiveOverwrite,
    dryRun,
    yes,
    backupEnabled,
    backupDir,
    layout,
  };
};
