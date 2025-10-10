import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { colors } from './colors.js';

export const isInteractive = (): boolean => {
  return !!(input.isTTY && output.isTTY);
};

export type SelectOption<T> = {
  value: T;
  label: string;
  description?: string;
};

export const promptSelect = async <T>(
  message: string,
  options: SelectOption<T>[],
  defaultIndex = 0,
): Promise<T> => {
  if (!isInteractive()) throw new Error('TTY required for interactive prompts');
  const rl = readline.createInterface({ input, output });
  try {
    options.forEach((opt, idx) => {
      const line = `  ${idx + 1}. ${opt.label}`;
      output.write(`${colors.cyan(line)}\n`);
      if (opt.description) {
        output.write(`     ${colors.dim(opt.description)}\n`);
      }
    });
    const range = `${1}-${options.length}`;
    while (true) {
      const ans = await rl.question(`${message} [${range}] (Enter for ${defaultIndex + 1}): `);
      const trimmed = ans.trim();
      if (!trimmed) return options[defaultIndex]!.value;
      const parsed = Number.parseInt(trimmed, 10);
      if (Number.isNaN(parsed) || parsed < 1 || parsed > options.length) {
        output.write(`${colors.yellow(`Please choose a number between 1 and ${options.length}.`)}\n`);
        continue;
      }
      return options[parsed - 1]!.value;
    }
  } finally {
    rl.close();
  }
};

export const promptChoice = async <T>(
  message: string,
  options: SelectOption<T>[],
  defaultIndex = 0,
): Promise<T> => {
  if (!isInteractive()) throw new Error('TTY required for interactive prompts');
  const rl = readline.createInterface({ input, output });
  try {
    output.write(`${colors.cyan(message)}\n`);
    options.forEach((opt, idx) => {
      const line = `  ${idx + 1}. ${opt.label}`;
      output.write(`${colors.cyan(line)}\n`);
      if (opt.description) {
        output.write(`     ${colors.dim(opt.description)}\n`);
      }
    });
    const range = `${1}-${options.length}`;
    while (true) {
      const ans = await rl.question(`Select option [${range}] (Enter for ${defaultIndex + 1}): `);
      const trimmed = ans.trim();
      if (!trimmed) return options[defaultIndex]!.value;
      const parsed = Number.parseInt(trimmed, 10);
      if (Number.isNaN(parsed) || parsed < 1 || parsed > options.length) {
        output.write(`${colors.yellow(`Please choose a number between 1 and ${options.length}.`)}\n`);
        continue;
      }
      return options[parsed - 1]!.value;
    }
  } finally {
    rl.close();
  }
};

export const promptConfirm = async (message: string, defaultYes = true): Promise<boolean> => {
  if (!isInteractive()) throw new Error('TTY required for interactive prompts');
  const rl = readline.createInterface({ input, output });
  try {
    const suffix = defaultYes ? '[Y/n]' : '[y/N]';
    while (true) {
      const ans = await rl.question(`${colors.cyan(message)} ${suffix} `);
      const trimmed = ans.trim().toLowerCase();
      if (!trimmed) return defaultYes;
      if (['y', 'yes'].includes(trimmed)) return true;
      if (['n', 'no'].includes(trimmed)) return false;
      output.write(`${colors.yellow('Please answer y or n.')}\n`);
    }
  } finally {
    rl.close();
  }
};

