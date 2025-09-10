import type { AgentType } from '../resolvers/agentLayout.js';
import type { OSType } from '../resolvers/os.js';
import type { TemplateContext } from '../template/context.js';

export type Manifest = {
  version: number;
  artifacts: ManifestArtifact[];
};

export type ManifestArtifact =
  | {
      id: string;
      source: { type: 'staticDir'; from: string; toDir: string };
      when?: { agent?: AgentType | AgentType[]; os?: OSType | OSType[] };
    }
  | {
      id: string;
      source: { type: 'templateFile'; from: string; toDir: string; rename?: string };
      when?: { agent?: AgentType | AgentType[]; os?: OSType | OSType[] };
    }
  | {
      id: string;
      source: { type: 'templateDir'; fromDir: string; toDir: string };
      when?: { agent?: AgentType | AgentType[]; os?: OSType | OSType[] };
    };

export type ProcessedArtifact =
  | {
      id: string;
      source: { type: 'staticDir'; from: string; toDir: string };
    }
  | {
      id: string;
      source: { type: 'templateFile'; from: string; toDir: string; outFile: string };
    }
  | {
      id: string;
      source: { type: 'templateDir'; fromDir: string; toDir: string };
    };

const shouldIncludeForAgent = (art: ManifestArtifact, agent: AgentType): boolean => {
  const cond = art.when?.agent;
  if (!cond) return true;
  if (Array.isArray(cond)) return cond.includes(agent);
  return cond === agent;
};

const shouldIncludeForOs = (art: ManifestArtifact, os: OSType): boolean => {
  const cond = art.when?.os;
  if (!cond) return true;
  if (Array.isArray(cond)) return cond.includes(os);
  return cond === os;
};

const applyPlaceholders = (input: string, agent: AgentType, ctx: TemplateContext): string => {
  const dict: Record<string, string> = {
    AGENT: agent,
    LANG_CODE: ctx.LANG_CODE,
    DEV_GUIDELINES: ctx.DEV_GUIDELINES,
    KIRO_DIR: ctx.KIRO_DIR,
    AGENT_DIR: ctx.AGENT_DIR,
    AGENT_DOC: ctx.AGENT_DOC,
    AGENT_COMMANDS_DIR: ctx.AGENT_COMMANDS_DIR,
  };
  return input.replace(/\{\{([A-Z0-9_]+)\}\}/g, (_m, key: string) => dict[key] ?? _m);
};

export const processManifest = (
  manifest: Manifest,
  agent: AgentType,
  ctx: TemplateContext,
  os: OSType,
): ProcessedArtifact[] => {
  const out: ProcessedArtifact[] = [];
  for (const art of manifest.artifacts) {
    if (!shouldIncludeForAgent(art as any, agent)) continue;
    if (!shouldIncludeForOs(art as any, os)) continue;
    if (art.source.type === 'staticDir') {
      const from = applyPlaceholders(art.source.from, agent, ctx);
      const toDir = applyPlaceholders(art.source.toDir, agent, ctx);
      out.push({ id: art.id, source: { type: 'staticDir', from, toDir } });
      continue;
    }

    if (art.source.type === 'templateFile') {
      const from = applyPlaceholders(art.source.from, agent, ctx);
      const toDir = applyPlaceholders(art.source.toDir, agent, ctx);
      const outFile = deriveOutFile(from, art.source.rename, agent, ctx);
      out.push({ id: art.id, source: { type: 'templateFile', from, toDir, outFile } });
      continue;
    }

    if (art.source.type === 'templateDir') {
      const fromDir = applyPlaceholders(art.source.fromDir, agent, ctx);
      const toDir = applyPlaceholders(art.source.toDir, agent, ctx);
      out.push({ id: art.id, source: { type: 'templateDir', fromDir, toDir } });
      continue;
    }
  }
  return out;
};

const deriveOutFile = (
  fromPath: string,
  rename: string | undefined,
  agent: AgentType,
  ctx: TemplateContext,
): string => {
  if (rename && rename.trim()) {
    return applyPlaceholders(rename, agent, ctx);
  }
  const base = fromPath.split('/').pop() ?? fromPath;
  if (base.endsWith('.tpl.md')) return base.slice(0, -('.tpl.md'.length)) + '.md';
  if (base.endsWith('.tpl.json')) return base.slice(0, -('.tpl.json'.length)) + '.json';
  return base;
};
