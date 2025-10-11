const supportsColor = !!process.stdout.isTTY && process.env.NO_COLOR !== '1';

const wrap = (open: string, close: string) => {
  return (value: string): string => {
    if (!supportsColor) return value;
    return `${open}${value}${close}`;
  };
};

export const colors = {
  green: wrap('\u001b[32m', '\u001b[39m'),
  red: wrap('\u001b[31m', '\u001b[39m'),
  yellow: wrap('\u001b[33m', '\u001b[39m'),
  cyan: wrap('\u001b[36m', '\u001b[39m'),
  magenta: wrap('\u001b[35m', '\u001b[39m'),
  bold: wrap('\u001b[1m', '\u001b[22m'),
  dim: wrap('\u001b[2m', '\u001b[22m'),
  reset: (value: string): string => value,
};

export const formatLabel = (label: string): string => colors.bold(colors.cyan(label));

export const formatHeading = (label: string): string => colors.bold(label);

export const formatSuccess = (msg: string): string => colors.green(msg);

export const formatWarning = (msg: string): string => colors.yellow(msg);

export const formatError = (msg: string): string => colors.red(msg);

export const formatAttention = (msg: string): string => {
  if (!supportsColor) return msg;
  return `\u001b[93m\u001b[1m${msg}\u001b[22m\u001b[39m`;
};

export const formatSectionTitle = (label: string): string => {
  if (!supportsColor) return `== ${label} ==`;
  return `
[35m[1m== ${label} ==[22m[39m`;
};
