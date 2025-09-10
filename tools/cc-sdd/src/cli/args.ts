import type { AgentType } from '../resolvers/agentLayout.js';
import type { OSType } from '../resolvers/os.js';

export type OverwritePolicy = 'prompt' | 'skip' | 'force';

export type ParsedArgs = {
  agent?: AgentType;
  lang?:
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
  os?: 'auto' | OSType;
  overwrite?: OverwritePolicy;
  yes?: boolean;
  dryRun?: boolean;
  backup?: boolean | string;
  kiroDir?: string;
  manifest?: string;
  profile?: 'full' | 'minimal';
};

const booleanFlags = new Set(['yes', 'y', 'dry-run', 'claude-code', 'gemini-cli', 'qwen-code', 'cursor', 'backup']);
const valueFlags = new Set(['agent', 'lang', 'os', 'overwrite', 'kiro-dir', 'backup', 'manifest', 'profile']);

const isKnownFlag = (name: string): boolean => booleanFlags.has(name) || valueFlags.has(name);

const isEnum = <T extends string>(val: string, allowed: readonly T[]): val is T =>
  (allowed as readonly T[]).includes(val as T);

export const parseArgs = (argv: string[]): ParsedArgs => {
  const out: ParsedArgs = {};
  let i = 0;

  // track agent to detect any conflicting multiple selections (flag vs alias, or alias vs alias)
  let seenAgent: AgentType | undefined;
  const setAgent = (value: AgentType) => {
    if (seenAgent && seenAgent !== value) {
      throw new Error('agent flag conflict between multiple agent selections');
    }
    seenAgent = value;
    out.agent = value;
  };

  while (i < argv.length) {
    const token = argv[i++];

    if (!token.startsWith('-')) {
      throw new Error(`Unknown positional argument: ${token}`);
    }

    // short flag
    if (token === '-y') {
      out.yes = true;
      continue;
    }

    if (token.startsWith('--')) {
      const eqIdx = token.indexOf('=');
      const name = token.slice(2, eqIdx > -1 ? eqIdx : undefined);
      if (!isKnownFlag(name)) {
        throw new Error(`Unknown flag: --${name}`);
      }

      let value: string | true | undefined;
      if (eqIdx > -1) {
        value = token.slice(eqIdx + 1);
      } else if (valueFlags.has(name)) {
        // consume next token as value iff present and not another flag
        const peek = argv[i];
        if (peek && !peek.startsWith('-')) {
          value = peek;
          i += 1;
        } else {
          // allow --backup with no value to mean boolean true
          if (name === 'backup') {
            value = true;
          } else {
            throw new Error(`Flag --${name} requires a value`);
          }
        }
      } else {
        value = true;
      }

      // map flags
      switch (name) {
        case 'dry-run':
          out.dryRun = true;
          break;
        case 'backup': {
          if (value === true) out.backup = true;
          else out.backup = String(value);
          break;
        }
        case 'yes':
          out.yes = true;
          break;
        case 'y':
          out.yes = true;
          break;
        case 'kiro-dir':
          out.kiroDir = String(value);
          break;
        case 'lang': {
          const v = String(value);
          if (
            !isEnum(
              v,
              [
                'ja',
                'en',
                'zh-TW',
                'zh',
                'es',
                'pt',
                'de',
                'fr',
                'ru',
                'it',
                'ko',
                'ar',
              ] as const,
            )
          )
            throw new Error('lang value invalid');
          out.lang = v;
          break;
        }
        case 'os': {
          const v = String(value);
          if (!isEnum(v, ['auto', 'mac', 'windows', 'linux'] as const)) throw new Error('os value invalid');
          out.os = v as any;
          break;
        }
        case 'overwrite': {
          const v = String(value);
          if (!isEnum(v, ['prompt', 'skip', 'force'] as const)) throw new Error('overwrite value invalid');
          out.overwrite = v;
          break;
        }
        case 'manifest': {
          out.manifest = String(value);
          break;
        }
        case 'profile': {
          const v = String(value);
          if (!isEnum(v, ['full', 'minimal'] as const)) throw new Error('profile value invalid');
          out.profile = v as 'full' | 'minimal';
          break;
        }
        case 'agent': {
          const v = String(value) as AgentType;
          if (!isEnum(v, ['claude-code', 'gemini-cli', 'qwen-code', 'cursor'] as const)) throw new Error('agent value invalid');
          setAgent(v);
          break;
        }
        case 'claude-code':
          setAgent('claude-code');
          break;
        case 'gemini-cli':
          setAgent('gemini-cli');
          break;
        case 'qwen-code':
          setAgent('qwen-code');
          break;
        case 'cursor':
          setAgent('cursor');
          break;
        default:
          // should not reach
          throw new Error(`Unknown flag: --${name}`);
      }
      continue;
    }

    throw new Error(`Unknown flag format: ${token}`);
  }

  return out;
};
