export type CliIO = {
  log: (msg: string) => void;
  error: (msg: string) => void;
  exit: (code: number) => void;
};

export const defaultIO: CliIO = {
  log: (s) => console.log(s),
  error: (s) => console.error(s),
  exit: (code) => process.exit(code),
};

