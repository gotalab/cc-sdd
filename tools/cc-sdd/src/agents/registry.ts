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
  upgradeNotice?: string;
}

const makeUpgradeNotice = (flag: string): string =>
  `This mode will be removed in a future release. Migrate now: npx cc-sdd@latest ${flag}`;

export const agentDefinitions = {
  'claude-code': {
    label: 'Claude Code',
    description:
      'Installs kiro prompts in `.claude/commands/kiro/`, shared settings in `{{KIRO_DIR}}/settings/` (default `.kiro/settings/`), and an AGENTS.md quickstart.',
    aliasFlags: ['--claude-code', '--claude'],
    recommendedModels: ['Planning / review: Claude Opus 4.6 or newer', 'Implementation: Claude Sonnet 4.6 or newer'],
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
    upgradeNotice: makeUpgradeNotice('--claude-skills'),
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
    recommendedModels: ['Planning / review: Claude Opus 4.6 or newer', 'Implementation: Claude Sonnet 4.6 or newer'],
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
    upgradeNotice: makeUpgradeNotice('--claude-skills'),
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
    recommendedModels: ['Planning / review: Claude Opus 4.6 or newer', 'Implementation: Claude Sonnet 4.6 or newer'],
    layout: {
      commandsDir: '.claude/skills',
      agentDir: '.claude',
      docFile: 'CLAUDE.md',
    },
    commands: {
      spec: '`/kiro-spec-init <what-to-build>`',
      steering: '`/kiro-steering`',
      steeringCustom: '`/kiro-steering-custom <what-to-create-custom-steering-document>`',
    },
    completionGuide: {
      prependSteps: [
        'If you are not sure whether the work should become one spec, many specs, or no spec at all, start with `/kiro-discovery <idea>`.',
      ],
      appendSteps: [
        'Use `/kiro-spec-quick <what-to-build> [--auto]` only when you intentionally want the fast path for a single spec.',
      ],
    },
    templateFallbacks: {
      'CLAUDE.md': '../../CLAUDE.md',
    },
    manifestId: 'claude-code-skills',
  },
  codex: {
    label: 'Codex CLI',
    description:
      'Deprecated: Codex no longer supports `.codex/prompts/`. Use `--codex-skills` instead.',
    aliasFlags: ['--codex', '--codex-cli'],
    recommendedModels: ['Planning / review: gpt-5.4 high or xhigh', 'Implementation: gpt-5.4'],
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
    upgradeNotice: makeUpgradeNotice('--codex-skills'),
    manifestId: 'codex',
  },
  'codex-skills': {
    label: 'Codex Skills',
    description:
      'Installs kiro skills in `.agents/skills/kiro-*/`, shared settings in `{{KIRO_DIR}}/settings/`, and an AGENTS.md quickstart.',
    aliasFlags: ['--codex-skills'],
    recommendedModels: ['Planning / review: gpt-5.4 high or xhigh', 'Implementation: gpt-5.4'],
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
    completionGuide: {
      prependSteps: [
        'If you are not sure whether the work should become one spec, many specs, or no spec at all, start with `$kiro-discovery <idea>`.',
      ],
      appendSteps: [
        'Use `$kiro-spec-quick <what-to-build> [--auto]` only when you intentionally want the fast path for a single spec.',
      ],
    },
    manifestId: 'codex-skills',
  },
  cursor: {
    label: 'Cursor IDE',
    description:
      'Installs kiro prompts in `.cursor/commands/kiro/`, shared settings in `{{KIRO_DIR}}/settings/`, and an AGENTS.md quickstart.',
    aliasFlags: ['--cursor'],
    recommendedModels: ['Planning / review: Claude Opus 4.6 or newer / gpt-5.4 high', 'Implementation: Claude Sonnet 4.6 or newer / gpt-5.4 / Composer 2'],
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
    upgradeNotice: makeUpgradeNotice('--cursor-skills'),
    manifestId: 'cursor',
  },
  'cursor-skills': {
    label: 'Cursor Skills',
    description:
      'Installs kiro skills in `.cursor/skills/kiro-*/`, shared settings in `{{KIRO_DIR}}/settings/`, and an AGENTS.md quickstart.',
    aliasFlags: ['--cursor-skills'],
    recommendedModels: ['Planning / review: Claude Opus 4.6 or newer / gpt-5.4 high', 'Implementation: Claude Sonnet 4.6 or newer / gpt-5.4 / Composer 2'],
    layout: {
      commandsDir: '.cursor/skills',
      agentDir: '.cursor',
      docFile: 'AGENTS.md',
    },
    commands: {
      spec: '`/kiro-spec-init <what-to-build>`',
      steering: '`/kiro-steering`',
      steeringCustom: '`/kiro-steering-custom <what-to-create-custom-steering-document>`',
    },
    completionGuide: {
      prependSteps: [
        'If you are not sure whether the work should become one spec, many specs, or no spec at all, start with `/kiro-discovery <idea>`.',
      ],
      appendSteps: [
        'Use `/kiro-spec-quick <what-to-build> [--auto]` only when you intentionally want the fast path for a single spec.',
      ],
    },
    manifestId: 'cursor-skills',
  },
  'github-copilot': {
    label: 'GitHub Copilot',
    description:
      'Installs kiro prompts in `.github/prompts/`, shared settings in `{{KIRO_DIR}}/settings/`, and an AGENTS.md quickstart.',
    aliasFlags: ['--copilot', '--github-copilot'],
    recommendedModels: ['Planning / review: Claude Opus 4.6 or newer / gpt-5.4 high', 'Implementation: Claude Sonnet 4.6 or newer / gpt-5.4'],
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
    upgradeNotice: makeUpgradeNotice('--copilot-skills'),
    manifestId: 'github-copilot',
  },
  'github-copilot-skills': {
    label: 'GitHub Copilot Skills',
    description:
      'Installs kiro skills in `.github/skills/kiro-*/`, shared settings in `{{KIRO_DIR}}/settings/`, and an AGENTS.md quickstart.',
    aliasFlags: ['--copilot-skills', '--github-copilot-skills'],
    recommendedModels: ['Planning / review: Claude Opus 4.6 or newer / gpt-5.4 high', 'Implementation: Claude Sonnet 4.6 or newer / gpt-5.4'],
    layout: {
      commandsDir: '.github/skills',
      agentDir: '.github',
      docFile: 'AGENTS.md',
    },
    commands: {
      spec: '`/kiro-spec-init <what-to-build>`',
      steering: '`/kiro-steering`',
      steeringCustom: '`/kiro-steering-custom <what-to-create-custom-steering-document>`',
    },
    completionGuide: {
      prependSteps: [
        'If you are not sure whether the work should become one spec, many specs, or no spec at all, start with `/kiro-discovery <idea>`.',
      ],
      appendSteps: [
        'Use `/kiro-spec-quick <what-to-build> [--auto]` only when you intentionally want the fast path for a single spec.',
      ],
    },
    manifestId: 'github-copilot-skills',
  },
  'gemini-cli': {
    label: 'Gemini CLI',
    description:
      'Installs kiro prompts in `.gemini/commands/kiro/`, shared settings in `{{KIRO_DIR}}/settings/`, and an AGENTS.md quickstart.',
    aliasFlags: ['--gemini-cli', '--gemini'],
    recommendedModels: ['Planning / review: Gemini 3.1 Pro or newer', 'Implementation: Gemini 3 Flash or newer'],
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
    upgradeNotice: makeUpgradeNotice('--gemini-skills'),
    manifestId: 'gemini-cli',
  },
  'gemini-cli-skills': {
    label: 'Gemini CLI Skills',
    description:
      'Installs kiro skills in `.gemini/skills/kiro-*/`, shared settings in `{{KIRO_DIR}}/settings/`, and a GEMINI.md quickstart.',
    aliasFlags: ['--gemini-cli-skills', '--gemini-skills'],
    recommendedModels: ['Planning / review: Gemini 3.1 Pro or newer', 'Implementation: Gemini 3 Flash or newer'],
    layout: {
      commandsDir: '.gemini/skills',
      agentDir: '.gemini',
      docFile: 'GEMINI.md',
    },
    commands: {
      spec: '`/kiro-spec-init <what-to-build>`',
      steering: '`/kiro-steering`',
      steeringCustom: '`/kiro-steering-custom <what-to-create-custom-steering-document>`',
    },
    completionGuide: {
      prependSteps: [
        'If you are not sure whether the work should become one spec, many specs, or no spec at all, start with `/kiro-discovery <idea>`.',
      ],
      appendSteps: [
        'Use `/kiro-spec-quick <what-to-build> [--auto]` only when you intentionally want the fast path for a single spec.',
      ],
    },
    manifestId: 'gemini-cli-skills',
  },
  windsurf: {
    label: 'Windsurf IDE',
    description:
      'Installs kiro workflows in `.windsurf/workflows/`, shared settings in `{{KIRO_DIR}}/settings/`, and an AGENTS.md quickstart.',
    aliasFlags: ['--windsurf'],
    recommendedModels: ['Planning / review: Claude Opus 4.6 or newer / gpt-5.4 high', 'Implementation: Claude Sonnet 4.6 or newer / gpt-5.4'],
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
    upgradeNotice: makeUpgradeNotice('--windsurf-skills'),
    manifestId: 'windsurf',
  },
  'windsurf-skills': {
    label: 'Windsurf Skills',
    description:
      'Installs kiro skills in `.windsurf/skills/kiro-*/`, shared settings in `{{KIRO_DIR}}/settings/`, and an AGENTS.md quickstart.',
    aliasFlags: ['--windsurf-skills'],
    recommendedModels: ['Planning / review: Claude Opus 4.6 or newer / gpt-5.4 high', 'Implementation: Claude Sonnet 4.6 or newer / gpt-5.4'],
    layout: {
      commandsDir: '.windsurf/skills',
      agentDir: '.windsurf',
      docFile: 'AGENTS.md',
    },
    commands: {
      spec: '`@kiro-spec-init <what-to-build>`',
      steering: '`@kiro-steering`',
      steeringCustom: '`@kiro-steering-custom <what-to-create-custom-steering-document>`',
    },
    completionGuide: {
      prependSteps: [
        'If you are not sure whether the work should become one spec, many specs, or no spec at all, start with `@kiro-discovery <idea>`.',
      ],
      appendSteps: [
        'Use `@kiro-spec-quick <what-to-build> [--auto]` only when you intentionally want the fast path for a single spec.',
      ],
    },
    manifestId: 'windsurf-skills',
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
    recommendedModels: ['Planning / review: gpt-5.4 high or xhigh', 'Implementation: gpt-5.4'],
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
    upgradeNotice: makeUpgradeNotice('--opencode-skills'),
    manifestId: 'opencode',
  },
  'opencode-agent': {
    label: 'OpenCode Agents',
    description:
      'Installs kiro commands in `.opencode/commands/`, a kiro agent library in `.opencode/agents/`, shared settings in `{{KIRO_DIR}}/settings/`, and an AGENTS.md quickstart.',
    aliasFlags: ['--opencode-agent'],
    recommendedModels: ['Planning / review: gpt-5.4 high or xhigh', 'Implementation: gpt-5.4'],
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
    upgradeNotice: makeUpgradeNotice('--opencode-skills'),
    templateFallbacks: {
      'AGENTS.md': '../../AGENTS.md',
    },
    manifestId: 'opencode-agent',
  },
  'opencode-skills': {
    label: 'OpenCode Skills',
    description:
      'Installs kiro skills in `.opencode/skills/kiro-*/`, shared settings in `{{KIRO_DIR}}/settings/`, and an AGENTS.md quickstart.',
    aliasFlags: ['--opencode-skills'],
    recommendedModels: ['Planning / review: gpt-5.4 high or xhigh', 'Implementation: gpt-5.4'],
    layout: {
      commandsDir: '.opencode/skills',
      agentDir: '.opencode',
      docFile: 'AGENTS.md',
    },
    commands: {
      spec: '`/kiro-spec-init <what-to-build>`',
      steering: '`/kiro-steering`',
      steeringCustom: '`/kiro-steering-custom <what-to-create-custom-steering-document>`',
    },
    completionGuide: {
      prependSteps: [
        'If you are not sure whether the work should become one spec, many specs, or no spec at all, start with `/kiro-discovery <idea>`.',
      ],
      appendSteps: [
        'Use `/kiro-spec-quick <what-to-build> [--auto]` only when you intentionally want the fast path for a single spec.',
      ],
    },
    manifestId: 'opencode-skills',
  },
  'antigravity-skills': {
    label: 'Antigravity Skills',
    description:
      'Installs kiro skills in `.agent/skills/kiro-*/`, shared settings in `{{KIRO_DIR}}/settings/`, and an AGENTS.md quickstart.',
    aliasFlags: ['--antigravity-skills', '--antigravity'],
    layout: {
      commandsDir: '.agent/skills',
      agentDir: '.agent',
      docFile: 'AGENTS.md',
    },
    commands: {
      spec: '`/kiro-spec-init <what-to-build>`',
      steering: '`/kiro-steering`',
      steeringCustom: '`/kiro-steering-custom <what-to-create-custom-steering-document>`',
    },
    completionGuide: {
      prependSteps: [
        'If you are not sure whether the work should become one spec, many specs, or no spec at all, start with `/kiro-discovery <idea>`.',
      ],
      appendSteps: [
        'Use `/kiro-spec-quick <what-to-build> [--auto]` only when you intentionally want the fast path for a single spec.',
      ],
    },
    manifestId: 'antigravity-skills',
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
