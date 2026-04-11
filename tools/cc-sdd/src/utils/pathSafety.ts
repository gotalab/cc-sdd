import path from 'node:path';

export const isPathInsideRoot = (targetPath: string, rootPath: string): boolean => {
  const resolvedRoot = path.resolve(rootPath);
  const resolvedTarget = path.resolve(targetPath);
  const relative = path.relative(resolvedRoot, resolvedTarget);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
};

export const assertPathInsideRoot = (
  targetPath: string,
  rootPath: string,
  label: string,
): string => {
  const resolvedRoot = path.resolve(rootPath);
  const resolvedTarget = path.resolve(targetPath);
  if (!isPathInsideRoot(resolvedTarget, resolvedRoot)) {
    throw new Error(`${label} must stay within ${resolvedRoot}`);
  }
  return resolvedTarget;
};

export const resolveRelativePathInsideRoot = (
  rootPath: string,
  inputPath: string,
  label: string,
): string => {
  if (!inputPath || typeof inputPath !== 'string') {
    throw new Error(`${label} must be a non-empty string`);
  }
  if (path.isAbsolute(inputPath)) {
    throw new Error(`${label} must be a relative path`);
  }
  return assertPathInsideRoot(path.resolve(rootPath, inputPath), rootPath, label);
};

