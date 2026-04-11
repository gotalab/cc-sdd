import { lstat, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';

export const ensureDir = async (dir: string): Promise<void> => {
  await mkdir(dir, { recursive: true });
};

export const fileExists = async (target: string): Promise<boolean> => {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
};

export const assertNoSymlinkInPath = async (target: string, boundary: string): Promise<void> => {
  const resolvedTarget = path.resolve(target);
  const resolvedBoundary = path.resolve(boundary);

  let current = resolvedTarget;
  while (true) {
    try {
      const info = await lstat(current);
      if (info.isSymbolicLink()) {
        throw new Error(`Refusing to write through symlink: ${current}`);
      }
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err?.code !== 'ENOENT') throw error;
    }

    if (current === resolvedBoundary) break;

    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
};
