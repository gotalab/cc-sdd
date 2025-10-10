import { describe, it, expect } from 'vitest';
import { resolveKiroDir, defaultKiroDir } from '../src/resolvers/kiroDir';

describe('resolveKiroDir', () => {
  it('returns default when neither flag nor config is set', () => {
    expect(resolveKiroDir({})).toBe(defaultKiroDir);
  });

  it('prefers config over default', () => {
    expect(resolveKiroDir({ config: 'docs/kiro' })).toBe('docs/kiro');
  });

  it('prefers flag over config', () => {
    expect(resolveKiroDir({ flag: '.work/kiro', config: 'docs/kiro' })).toBe('.work/kiro');
  });

  it('trims trailing slashes', () => {
    expect(resolveKiroDir({ flag: 'docs/kiro/' })).toBe('docs/kiro');
  });

  it('deduplicates consecutive slashes', () => {
    expect(resolveKiroDir({ flag: '.kiro//specs//' })).toBe('.kiro/specs');
  });

  it('rejects absolute path', () => {
    expect(() => resolveKiroDir({ flag: '/abs/path' })).toThrow();
  });

  it('rejects parent traversal', () => {
    expect(() => resolveKiroDir({ flag: '../up' })).toThrow();
  });

  it('rejects disallowed characters', () => {
    expect(() => resolveKiroDir({ flag: 'kiro bad' })).toThrow();
  });
});
