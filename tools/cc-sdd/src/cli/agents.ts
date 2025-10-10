import type { AgentType } from '../resolvers/agentLayout.js';
import type { CliIO } from './io.js';
import { colors, formatAttention, formatHeading, formatSectionTitle } from './ui/colors.js';
import { isInteractive, promptSelect } from './ui/prompt.js';

export type AgentOption = {
  value: AgentType;
  label: string;
  description: string;
  flags: string[];
};

export const agentOptions: AgentOption[] = [
  {
    value: 'claude-code',
    label: 'Claude Code (Desktop app)',
    description:
      'Installs kiro prompts in `.claude/commands/kiro/`, shared settings in `{{KIRO_DIR}}/settings/` (default `.kiro/settings/`), and an AGENTS.md quickstart.',
    flags: ['--claude-code', '--claude'],
  },
  {
    value: 'codex',
    label: 'Codex CLI',
    description:
      'Installs kiro prompts in `.codex/prompts/`, shared settings in `{{KIRO_DIR}}/settings/`, and an AGENTS.md quickstart.',
    flags: ['--codex', '--codex-cli'],
  },
  {
    value: 'cursor',
    label: 'Cursor IDE',
    description:
      'Installs kiro prompts in `.cursor/commands/kiro/`, shared settings in `{{KIRO_DIR}}/settings/`, and an AGENTS.md quickstart.',
    flags: ['--cursor'],
  },
  {
    value: 'github-copilot',
    label: 'GitHub Copilot Chat',
    description:
      'Installs kiro prompts in `.github/prompts/`, shared settings in `{{KIRO_DIR}}/settings/`, and an AGENTS.md quickstart.',
    flags: ['--copilot', '--github-copilot'],
  },
  {
    value: 'gemini-cli',
    label: 'Gemini CLI',
    description:
      'Installs kiro prompts in `.gemini/commands/kiro/`, shared settings in `{{KIRO_DIR}}/settings/`, and an AGENTS.md quickstart.',
    flags: ['--gemini-cli', '--gemini'],
  },
  {
    value: 'qwen-code',
    label: 'Qwen Code',
    description:
      'Installs kiro prompts in `.qwen/commands/kiro/`, shared settings in `{{KIRO_DIR}}/settings/`, and an AGENTS.md quickstart.',
    flags: ['--qwen-code', '--qwen'],
  },
];

const recommendedModels: Partial<Record<AgentType, string[]>> = {
  'claude-code': ['Claude 4.5 Sonnet or newer'],
  codex: ['GPT-5-Codex (e.g. gpt-5-codex medium, gpt-5-codex high)'],
  cursor: [
    'Claude 4.5 Sonnet or newer — turn on thinking mode',
    'GPT-5-Codex',
  ],
  'github-copilot': ['Claude 4.5 Sonnet or newer'],
  'gemini-cli': ['Gemini 2.5 Pro or newer'],
};

export const ensureAgentSelection = async (
  current: AgentType | undefined,
  io: CliIO,
): Promise<AgentType | undefined> => {
  if (current || !isInteractive()) return current;

  io.log(formatHeading('Select the agent you want to set up:'));

  const option = await promptSelect(
    'Agent number',
    agentOptions.map((opt) => ({
      value: opt.value,
      label: `${opt.label} (${opt.flags[0] ?? `--${opt.value}`})`,
      description: opt.description,
    })),
  );
  return option;
};

const docFiles: Record<AgentType, string> = {
  'claude-code': 'CLAUDE.md',
  codex: 'AGENTS.md',
  cursor: 'AGENTS.md',
  'github-copilot': 'AGENTS.md',
  'gemini-cli': 'GEMINI.md',
  'qwen-code': 'QWEN.md',
};

const specCommands: Record<AgentType, string> = {
  'claude-code': '`/kiro:spec-init <what-to-build>`',
  codex: '`/prompts:kiro-spec-init <what-to-build>`',
  cursor: '`/kiro/spec-init <what-to-build>`',
  'github-copilot': '`/kiro-spec-init <what-to-build>`',
  'gemini-cli': '`gemini /kiro:spec-init "<what-to-build>"`',
  'qwen-code': '`/kiro:spec-init <what-to-build>`',
};

const steeringCommands: Record<AgentType, string> = {
  'claude-code': '`/kiro:steering`',
  codex: '`/prompts:kiro-steering`',
  cursor: '`/kiro/steering`',
  'github-copilot': '`/kiro-steering`',
  'gemini-cli': '`gemini /kiro:steering`',
  'qwen-code': '`/kiro:steering`',
};

const steeringCustomCommands: Record<AgentType, string> = {
  'claude-code': '`/kiro:steering-custom`',
  codex: '`/prompts:kiro-steering-custom`',
  cursor: '`/kiro/steering-custom`',
  'github-copilot': '`/kiro-steering-custom`',
  'gemini-cli': '`gemini /kiro:steering-custom`',
  'qwen-code': '`/kiro:steering-custom`',
};

const agentLabels: Record<AgentType, string> = agentOptions.reduce((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {} as Record<AgentType, string>);

const guideSteps: Record<AgentType, string[]> = (Object.keys(specCommands) as AgentType[]).reduce(
  (acc, agent) => {
    const label = agentLabels[agent];
    const doc = docFiles[agent];
    const command = specCommands[agent];
    const steeringCommand = steeringCommands[agent];
    const steeringCustomCommand = steeringCustomCommands[agent];
    acc[agent] = [
      `Launch ${label} and run ${command} to create a new specification.`,
      `Tip: Steering holds persistent project knowledge—patterns, standards, and org-wide policies. Kick off ${steeringCommand} (essential for existing projects) and  ${steeringCustomCommand}. Maintain Regularly`,
      'Tip: Update `{{KIRO_DIR}}/settings/templates/` like `requirements.md`, `design.md`, and `tasks.md` so the generated steering and specs follow your team\'s and project\'s development process.',
    ];
    return acc;
  },
  {} as Record<AgentType, string[]>,
);

guideSteps.codex.unshift(
  [
    'Move Codex Custom prompts to ~/.codex/prompts by running:',
    '    mkdir -p ~/.codex/prompts \\',
    '      && cp -Ri ./.codex/prompts/ ~/.codex/prompts/ \\',
    "      && printf '\\n==== COPY PHASE DONE ====\\n' \\",
    "      && printf 'Remove original ./.codex/prompts ? [y/N]: ' \\",
    '      && IFS= read -r a \\',
    '      && case "$a" in [yY]) rm -rf ./.codex/prompts && echo \'Removed.\' ;; *) echo \'Kept original.\' ;; esac',
  ].join('\n'),
);

export const printCompletionGuide = (agent: AgentType, io: CliIO): void => {
  io.log('');
  const models = recommendedModels[agent];
  if (models && models.length > 0) {
    io.log(formatSectionTitle('Recommended models'));
    models.forEach((model) => io.log(formatAttention(`  • ${model}`)));
    io.log('');
  }
  io.log(formatSectionTitle('Next steps'));
  guideSteps[agent]?.forEach((step, idx) => {
    io.log(colors.cyan(`  ${idx + 1}. ${step}`));
  });
};
