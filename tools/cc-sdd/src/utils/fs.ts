import { mkdir, stat } from 'node:fs/promises';

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
