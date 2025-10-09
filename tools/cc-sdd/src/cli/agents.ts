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

const guideSteps: Record<AgentType, string[]> = {
  'claude-code': [
    'Launch Claude desktop and run `/kiro:spec-init <feature>` to generate your first spec.',
    'Review `.claude/commands/kiro/` to see the available commands.',
    'Adjust `{{KIRO_DIR}}/settings/` to fine-tune project rules before continuing.',
  ],
  codex: [
    'Open the Codex CLI and execute `/prompts:kiro-spec-init <feature>` to initialise a new specification.',
    'Inspect `.codex/prompts/` to learn the available commands and workflow order.',
    'Read `AGENTS.md` for Codex-specific shortcuts and tips.',
  ],
  cursor: [
    'Open Cursor\'s side panel and run `/kiro/spec-init <feature>` with Claude 4 Sonnet in thinking mode.',
    'Review `.cursor/commands/kiro/` to confirm prompts synced correctly.',
    'Keep `{{KIRO_DIR}}/settings/` up to date so subsequent AI runs follow your project rules.',
  ],
  'github-copilot': [
    'Open GitHub Copilot Chat and ask it to run the prompt `kiro-spec-init` for your feature.',
    'Read `.github/prompts/` to understand the generated workflows.',
    'Use `AGENTS.md` for a walkthrough of the Copilot-focused development cycle.',
  ],
  'gemini-cli': [
    'Use `gemini /kiro:spec-init "<feature>"` to kick off the first specification conversation.',
    'Browse `.gemini/commands/kiro/` to preview the available stages.',
    'Adjust `{{KIRO_DIR}}/settings/` as needed before moving to design and tasks generation.',
  ],
  'qwen-code': [
    'Run `/kiro:spec-init <feature>` inside your Qwen Code environment to begin the workflow.',
    'Check `.qwen/commands/kiro/` to confirm prompt files and available steps.',
    'Review `{{KIRO_DIR}}/settings/` so the assistant stays aligned with your project rules.',
  ],
};

export const printCompletionGuide = (agent: AgentType, io: CliIO): void => {
  const option = agentOptions.find((opt) => opt.value === agent);
  io.log('');
  if (agent === 'cursor') {
    io.log(formatAttention('Recommended: Use claude-4-sonnet or later model with thinking mode enabled.'));
  }
  io.log(formatSectionTitle('Next steps'));
  guideSteps[agent]?.forEach((step, idx) => {
    io.log(colors.cyan(`  ${idx + 1}. ${step}`));
  });
};
