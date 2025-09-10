import type { ResolvedConfig } from '../cli/config.js';
import type { TemplateContext } from './context.js';
import { getDevGuidelines } from './context.js';

export const contextFromResolved = (resolved: ResolvedConfig): TemplateContext => ({
  LANG_CODE: resolved.lang,
  DEV_GUIDELINES: getDevGuidelines(resolved.lang),
  KIRO_DIR: resolved.kiroDir,
  AGENT_DIR: resolved.layout.agentDir,
  AGENT_DOC: resolved.layout.docFile,
  AGENT_COMMANDS_DIR: resolved.layout.commandsDir,
});
