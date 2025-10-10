export type AgentType = 'claude-code' | 'gemini-cli' | 'qwen-code' | 'cursor' | 'codex' | 'github-copilot';

export interface AgentLayout {
  commandsDir: string;
  agentDir: string;
  docFile: string;
}

export interface CCSddConfig {
  agentLayouts?: Partial<Record<AgentType, Partial<AgentLayout>>>;
}

export const resolveAgentLayout = (agent: AgentType, config?: CCSddConfig): AgentLayout => {
  const defaults: Record<AgentType, AgentLayout> = {
    'claude-code': {
      commandsDir: '.claude/commands/kiro',
      agentDir: '.claude',
      docFile: 'CLAUDE.md',
    },
    'gemini-cli': {
      commandsDir: '.gemini/commands/kiro',
      agentDir: '.gemini',
      docFile: 'GEMINI.md',
    },
    'qwen-code': {
      commandsDir: '.qwen/commands/kiro',
      agentDir: '.qwen',
      docFile: 'QWEN.md',
    },
    'cursor': {
      commandsDir: '.cursor/commands/kiro',
      agentDir: '.cursor',
      docFile: 'AGENTS.md',
    },
    'codex': {
      commandsDir: '.codex/prompts',
      agentDir: '.codex',
      docFile: 'AGENTS.md',
    },
    'github-copilot': {
      commandsDir: '.github/prompts',
      agentDir: '.github',
      docFile: 'AGENTS.md',
    },
  };

  const base = defaults[agent];
  const override = config?.agentLayouts?.[agent] ?? {};
  return { ...base, ...override } as AgentLayout;
};
