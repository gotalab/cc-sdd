import { mkdtemp, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/**
 * Creates a mock IO object for testing CLI interactions.
 * Captures log and error messages in arrays for assertion.
 */
export const makeIO = () => {
  const logs: string[] = [];
  const errs: string[] = [];
  return {
    io: {
      log: (m: string) => logs.push(m),
      error: (m: string) => errs.push(m),
      exit: (_c: number) => {},
    },
    get logs() {
      return logs;
    },
    get errs() {
      return errs;
    },
  };
};

/**
 * Creates a temporary directory with a consistent prefix.
 * @param prefix - Optional prefix for the temp directory (default: 'ccsdd-test-')
 */
export const mkTmp = async (prefix: string = 'ccsdd-test-') =>
  mkdtemp(join(tmpdir(), prefix));

/**
 * Checks if a file or directory exists at the given path.
 * @param p - Path to check
 * @returns true if exists, false otherwise
 */
export const exists = async (p: string): Promise<boolean> => {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
};

/**
 * Gets the repository root path.
 * Assumes vitest runs in tools/cc-sdd; repoRoot is two levels up.
 */
export const getRepoRoot = () => join(process.cwd(), '..', '..');
