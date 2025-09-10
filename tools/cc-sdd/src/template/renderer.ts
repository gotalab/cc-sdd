import type { AgentType } from '../resolvers/agentLayout.js';
import type { TemplateContext } from './context.js';

const buildDict = (agent: AgentType, ctx: TemplateContext): Record<string, string> => ({
  AGENT: agent,
  LANG_CODE: ctx.LANG_CODE,
  DEV_GUIDELINES: ctx.DEV_GUIDELINES,
  KIRO_DIR: ctx.KIRO_DIR,
  AGENT_DIR: ctx.AGENT_DIR,
  AGENT_DOC: ctx.AGENT_DOC,
  AGENT_COMMANDS_DIR: ctx.AGENT_COMMANDS_DIR,
});

const replacePlaceholders = (input: string, dict: Record<string, string>): string =>
  input.replace(/\{\{([A-Z0-9_]+)\}\}/g, (m, key: string) => (key in dict ? dict[key] : m));

export const renderTemplateString = (
  input: string,
  agent: AgentType,
  ctx: TemplateContext,
): string => {
  const dict = buildDict(agent, ctx);
  return replacePlaceholders(input, dict);
};

export const renderJsonTemplate = (
  input: string,
  agent: AgentType,
  ctx: TemplateContext,
): unknown => {
  const rendered = renderTemplateString(input, agent, ctx);
  try {
    return JSON.parse(rendered);
  } catch (err) {
    throw new Error('Invalid JSON after template substitution');
  }
};
