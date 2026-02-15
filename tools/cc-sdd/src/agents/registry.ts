export interface AgentLayoutDefaults {
  commandsDir: string;
  agentDir: string;
  docFile: string;
}

export interface AgentCommandHints {
  spec: string;
  steering: string;
  steeringCustom: string;
}

export interface AgentCompletionGuide {
  prependSteps?: string[];
  appendSteps?: string[];
}

export interface AgentDefinition {
  label: string;
  description: string;
  aliasFlags: string[];
  recommendedModels?: string[];
  layout: AgentLayoutDefaults;
  commands: AgentCommandHints;
  manifestId?: string;
  completionGuide?: AgentCompletionGuide;
  templateFallbacks?: Record<string, string>;
}

const codexCopyInstruction = String.raw`Move Codex Custom prompts to ~/.codex/prompts by running:
    mkdir -p ~/.codex/prompts \
      && cp -Ri ./.codex/prompts/. ~/.codex/prompts/ \
      && printf '\n==== COPY PHASE DONE ====\n' \
      && printf 'Remove original ./.codex/prompts ? [y/N]: ' \
      && IFS= read -r a \
      && case "$a" in [yY]) rm -rf ./.codex/prompts && echo 'Removed.' ;; *) echo 'Kept original.' ;; esac`;

const codexLegacyPromptNotice =
  'Note: Codex prompts mode (`--codex`) is kept for compatibility and is non-recommended. Prefer `--codex-skills` for new setups.';

export const agentDefinitions = {
  'claude-code': {
    label: 'Claude Code',
    description:
      'Installs kiro prompts in `.claude/commands/kiro/`, shared settings in `{{KIRO_DIR}}/settings/` (default `.kiro/settings/`), and an AGENTS.md quickstart.',
    aliasFlags: ['--claude-code', '--claude'],
    recommendedModels: ['Claude Opus 4.5 or newer'],
    layout: {
      commandsDir: '.claude/commands/kiro',
      agentDir: '.claude',
      docFile: 'CLAUDE.md',
    },
    commands: {
      spec: '`/kiro:spec-init <what-to-build>`',
      steering: '`/kiro:steering`',
      steeringCustom: '`/kiro:steering-custom <what-to-create-custom-steering-document>`',
    },
    templateFallbacks: {
      'CLAUDE.md': '../../CLAUDE.md',
    },
    manifestId: 'claude-code',
  },
  'claude-code-agent': {
    label: 'Claude Code Agents',
    description:
      'Installs kiro prompts in `.claude/commands/kiro/`, a Claude agent library in `.claude/agents/kiro/`, shared settings in `{{KIRO_DIR}}/settings/`, and a CLAUDE.md quickstart.',
    aliasFlags: ['--claude-code-agent', '--claude-agent'],
    recommendedModels: ['Claude Opus 4.5 or newer'],
    layout: {
      commandsDir: '.claude/commands/kiro',
      agentDir: '.claude',
      docFile: 'CLAUDE.md',
    },
    commands: {
      spec: '`/kiro:spec-quick <what-to-build>`',
      steering: '`/kiro:steering`',
      steeringCustom: '`/kiro:steering-custom <what-to-create-custom-steering-document>`',
    },
    templateFallbacks: {
      'CLAUDE.md': '../../CLAUDE.md',
    },
    manifestId: 'claude-code-agent',
  },
  'claude-code-skills': {
    label: 'Claude Code Skills',
    description:
      'Installs kiro skills in `.claude/skills/kiro-*/`, shared settings in `{{KIRO_DIR}}/settings/`, and a CLAUDE.md quickstart.',
    aliasFlags: ['--claude-code-skills', '--claude-skills'],
    recommendedModels: ['Claude Opus 4.5 or newer'],
    layout: {
      commandsDir: '.claude/skills',
      agentDir: '.claude',
      docFile: 'CLAUDE.md',
    },
    commands: {
      spec: '`/kiro-spec-quick <what-to-build>`',
      steering: '`/kiro-steering`',
      steeringCustom: '`/kiro-steering-custom <what-to-create-custom-steering-document>`',
    },
    templateFallbacks: {
      'CLAUDE.md': '../../CLAUDE.md',
    },
    manifestId: 'claude-code-skills',
  },
  codex: {
    label: 'Codex CLI',
    description:
      'Installs kiro prompts in `.codex/prompts/` as a legacy compatibility mode (non-recommended), shared settings in `{{KIRO_DIR}}/settings/`, and an AGENTS.md quickstart. Prefer `--codex-skills`.',
    aliasFlags: ['--codex', '--codex-cli'],
    recommendedModels: ['gpt-5.2-codex', 'gpt-5.2'],
    layout: {
      commandsDir: '.codex/prompts',
      agentDir: '.codex',
      docFile: 'AGENTS.md',
    },
    commands: {
      spec: '`/prompts:kiro-spec-init <what-to-build>`',
      steering: '`/prompts:kiro-steering`',
      steeringCustom: '`/prompts:kiro-steering-custom <what-to-create-custom-steering-document>`',
    },
    completionGuide: {
      prependSteps: [codexLegacyPromptNotice, codexCopyInstruction],
    },
    manifestId: 'codex',
  },
  'codex-skills': {
    label: 'Codex Skills',
    description:
      'Installs kiro skills in `.agents/skills/kiro-*/`, shared settings in `{{KIRO_DIR}}/settings/`, and an AGENTS.md quickstart.',
    aliasFlags: ['--codex-skills'],
    recommendedModels: ['gpt-5.2-codex', 'gpt-5.2'],
    layout: {
      commandsDir: '.agents/skills',
      agentDir: '.agents',
      docFile: 'AGENTS.md',
    },
    commands: {
      spec: '`$kiro-spec-init <what-to-build>`',
      steering: '`$kiro-steering`',
      steeringCustom: '`$kiro-steering-custom <what-to-create-custom-steering-document>`',
    },
    manifestId: 'codex-skills',
  },
  cursor: {
    label: 'Cursor IDE',
    description:
      'Installs kiro prompts in `.cursor/commands/kiro/`, shared settings in `{{KIRO_DIR}}/settings/`, and an AGENTS.md quickstart.',
    aliasFlags: ['--cursor'],
    recommendedModels: ['Claude Opus 4.5 or newer', 'gpt-5.2-codex', 'gpt-5.2'],
    layout: {
      commandsDir: '.cursor/commands/kiro',
      agentDir: '.cursor',
      docFile: 'AGENTS.md',
    },
    commands: {
      spec: '`/kiro/spec-init <what-to-build>`',
      steering: '`/kiro/steering`',
      steeringCustom: '`/kiro/steering-custom <what-to-create-custom-steering-document>`',
    },
    manifestId: 'cursor',
  },
  'github-copilot': {
    label: 'GitHub Copilot',
    description:
      'Installs kiro prompts in `.github/prompts/`, shared settings in `{{KIRO_DIR}}/settings/`, and an AGENTS.md quickstart.',
    aliasFlags: ['--copilot', '--github-copilot'],
    recommendedModels: ['Claude Opus 4.5 or newer', 'gpt-5.2-codex', 'gpt-5.2'],
    layout: {
      commandsDir: '.github/prompts',
      agentDir: '.github',
      docFile: 'AGENTS.md',
    },
    commands: {
      spec: '`/kiro-spec-init <what-to-build>`',
      steering: '`/kiro-steering`',
      steeringCustom: '`/kiro-steering-custom <what-to-create-custom-steering-document>`',
    },
    manifestId: 'github-copilot',
  },
  'gemini-cli': {
    label: 'Gemini CLI',
    description:
      'Installs kiro prompts in `.gemini/commands/kiro/`, shared settings in `{{KIRO_DIR}}/settings/`, and an AGENTS.md quickstart.',
    aliasFlags: ['--gemini-cli', '--gemini'],
    recommendedModels: ['Gemini 3 Flash or newer'],
    layout: {
      commandsDir: '.gemini/commands/kiro',
      agentDir: '.gemini',
      docFile: 'GEMINI.md',
    },
    commands: {
      spec: '`/kiro:spec-init <what-to-build>`',
      steering: '`/kiro:steering`',
      steeringCustom: '`/kiro:steering-custom <what-to-create-custom-steering-document>`',
    },
    manifestId: 'gemini-cli',
  },
  windsurf: {
    label: 'Windsurf IDE',
    description:
      'Installs kiro workflows in `.windsurf/workflows/`, shared settings in `{{KIRO_DIR}}/settings/`, and an AGENTS.md quickstart.',
    aliasFlags: ['--windsurf'],
    recommendedModels: ['Claude Opus 4.5 or newer', 'gpt-5.2-codex', 'gpt-5.2'],
    layout: {
      commandsDir: '.windsurf/workflows',
      agentDir: '.windsurf',
      docFile: 'AGENTS.md',
    },
    commands: {
      spec: '`/kiro-spec-init <what-to-build>`',
      steering: '`/kiro-steering`',
      steeringCustom: '`/kiro-steering-custom <what-to-create-custom-steering-document>`',
    },
    manifestId: 'windsurf',
  },
  'qwen-code': {
    label: 'Qwen Code',
    description:
      'Installs kiro prompts in `.qwen/commands/kiro/`, shared settings in `{{KIRO_DIR}}/settings/`, and an AGENTS.md quickstart.',
    aliasFlags: ['--qwen-code', '--qwen'],
    layout: {
      commandsDir: '.qwen/commands/kiro',
      agentDir: '.qwen',
      docFile: 'QWEN.md',
    },
    commands: {
      spec: '`/kiro:spec-init <what-to-build>`',
      steering: '`/kiro:steering`',
      steeringCustom: '`/kiro:steering-custom`',
    },
    manifestId: 'qwen-code',
  },
  'opencode': {
    label: 'OpenCode',
    description:
      'Installs kiro prompts in `.opencode/commands/`, shared settings in `{{KIRO_DIR}}/settings/`, and an AGENTS.md quickstart.',
    aliasFlags: ['--opencode'],
    recommendedModels: ['gpt-5.2-codex', 'gpt-5.2'],
    layout: {
      commandsDir: '.opencode/commands',
      agentDir: '.opencode',
      docFile: 'AGENTS.md',
    },
    commands: {
      spec: '`/kiro-spec-init <what-to-build>`',
      steering: '`/kiro-steering`',
      steeringCustom: '`/kiro-steering-custom <what-to-create-custom-steering-document>`',
    },
    manifestId: 'opencode',
  },
  'opencode-agent': {
    label: 'OpenCode Agents',
    description:
      'Installs kiro commands in `.opencode/commands/`, a kiro agent library in `.opencode/agents/`, shared settings in `{{KIRO_DIR}}/settings/`, and an AGENTS.md quickstart.',
    aliasFlags: ['--opencode-agent'],
    recommendedModels: ['gpt-5.2-codex', 'gpt-5.2'],
    layout: {
      commandsDir: '.opencode/commands',
      agentDir: '.opencode',
      docFile: 'AGENTS.md',
    },
    commands: {
      spec: '`/kiro-spec-quick <what-to-build>`',
      steering: '`/kiro-steering`',
      steeringCustom: '`/kiro-steering-custom <what-to-create-custom-steering-document>`',
    },
    templateFallbacks: {
      'AGENTS.md': '../../AGENTS.md',
    },
    manifestId: 'opencode-agent',
  },
} as const satisfies Record<string, AgentDefinition>;

export type AgentType = keyof typeof agentDefinitions;

export const getAgentDefinition = (agent: AgentType): AgentDefinition => {
  const definition = agentDefinitions[agent];
  if (!definition) {
    throw new Error(`Unknown agent: ${agent as string}`);
  }
  return definition as AgentDefinition;
};

export const agentList = Object.keys(agentDefinitions) as AgentType[];
