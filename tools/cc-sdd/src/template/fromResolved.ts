import type { ResolvedConfig } from '../cli/config.js';
import type { TemplateContext } from './context.js';
import { createTemplateContext } from './context.js';

export const contextFromResolved = (resolved: ResolvedConfig): TemplateContext =>
  createTemplateContext(resolved.lang, resolved.kiroDir, resolved.layout);
