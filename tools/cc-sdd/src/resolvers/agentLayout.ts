import { getAgentDefinition, type AgentType } from '../agents/registry.js';

export type { AgentType } from '../agents/registry.js';

export interface AgentLayout {
  commandsDir: string;
  agentDir: string;
  docFile: string;
}

export interface CCSddConfig {
  agentLayouts?: Partial<Record<AgentType, Partial<AgentLayout>>>;
}

export const resolveAgentLayout = (agent: AgentType, config?: CCSddConfig): AgentLayout => {
  const base = getAgentDefinition(agent).layout;
  const override = config?.agentLayouts?.[agent] ?? {};
  return { ...base, ...override } as AgentLayout;
};
