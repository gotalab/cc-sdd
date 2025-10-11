import { agentList, getAgentDefinition, type AgentType } from '../agents/registry.js';
import type { CliIO } from './io.js';
import { colors, formatAttention, formatHeading, formatSectionTitle } from './ui/colors.js';
import { isInteractive, promptSelect } from './ui/prompt.js';

export type AgentOption = {
  value: AgentType;
  label: string;
  description: string;
  flags: string[];
};

export const agentOptions: AgentOption[] = agentList.map((value) => {
  const definition = getAgentDefinition(value);
  return {
    value,
    label: definition.label,
    description: definition.description,
    flags: definition.aliasFlags,
  };
});

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

const buildGuideSteps = (agent: AgentType): string[] => {
  const definition = getAgentDefinition(agent);
  const steps: string[] = [
    `Launch ${definition.label} and run ${definition.commands.spec} to create a new specification.`,
    `Tip: Steering holds persistent project knowledge—patterns, standards, and org-wide policies. Kick off ${definition.commands.steering} (essential for existing projects) and  ${definition.commands.steeringCustom}. Maintain Regularly`,
    'Tip: Update `{{KIRO_DIR}}/settings/templates/` like `requirements.md`, `design.md`, and `tasks.md` so the generated steering and specs follow your team\'s and project\'s development process.',
  ];

  if (definition.completionGuide?.prependSteps) {
    steps.unshift(...definition.completionGuide.prependSteps);
  }
  if (definition.completionGuide?.appendSteps) {
    steps.push(...definition.completionGuide.appendSteps);
  }

  return steps;
};

export const printCompletionGuide = (agent: AgentType, io: CliIO): void => {
  io.log('');
  const definition = getAgentDefinition(agent);
  const models = definition.recommendedModels;
  if (models && models.length > 0) {
    io.log(formatSectionTitle('Recommended models'));
    models.forEach((model) => io.log(formatAttention(`  • ${model}`)));
    io.log('');
  }
  io.log(formatSectionTitle('Next steps'));
  buildGuideSteps(agent).forEach((step, idx) => {
    io.log(colors.cyan(`  ${idx + 1}. ${step}`));
  });
};
