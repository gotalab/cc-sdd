import { resolveKiroDir, type KiroDirOptions } from '../resolvers/kiroDir.js';
import { resolveAgentLayout, type AgentLayout, type AgentType, type CCSddConfig } from '../resolvers/agentLayout.js';
import type { SupportedLanguage } from '../constants/languages.js';

export interface BuildTemplateContextOptions {
  agent: AgentType;
  lang: SupportedLanguage;
  kiroDir?: KiroDirOptions;
  config?: CCSddConfig;
}

export type TemplateContext = {
  LANG_CODE: string;
  DEV_GUIDELINES: string;
  KIRO_DIR: string;
  AGENT_DIR: string;
  AGENT_DOC: string;
  AGENT_COMMANDS_DIR: string;
};

const guidelinesMap: Record<SupportedLanguage, string> = {
  en: '- Think in English, generate responses in English. All Markdown content written to project files (e.g., requirements.md, design.md, tasks.md, research.md, validation reports) MUST be written in the target language configured for this specification (see spec.json.language).',
  ja: '- Think in English, generate responses in Japanese. All Markdown content written to project files (e.g., requirements.md, design.md, tasks.md, research.md, validation reports) MUST be written in the target language configured for this specification (see spec.json.language).',
  'zh-TW':
    '- Think in English, generate responses in Traditional Chinese. All Markdown content written to project files (e.g., requirements.md, design.md, tasks.md, research.md, validation reports) MUST be written in the target language configured for this specification (see spec.json.language).',
  zh: '- Think in English, generate responses in Simplified Chinese. All Markdown content written to project files (e.g., requirements.md, design.md, tasks.md, research.md, validation reports) MUST be written in the target language configured for this specification (see spec.json.language).',
  es: '- Think in English, generate responses in Spanish. All Markdown content written to project files (e.g., requirements.md, design.md, tasks.md, research.md, validation reports) MUST be written in the target language configured for this specification (see spec.json.language).',
  pt: '- Think in English, generate responses in Portuguese. All Markdown content written to project files (e.g., requirements.md, design.md, tasks.md, research.md, validation reports) MUST be written in the target language configured for this specification (see spec.json.language).',
  de: '- Think in English, generate responses in German. All Markdown content written to project files (e.g., requirements.md, design.md, tasks.md, research.md, validation reports) MUST be written in the target language configured for this specification (see spec.json.language).',
  fr: '- Think in English, generate responses in French. All Markdown content written to project files (e.g., requirements.md, design.md, tasks.md, research.md, validation reports) MUST be written in the target language configured for this specification (see spec.json.language).',
  ru: '- Think in English, generate responses in Russian. All Markdown content written to project files (e.g., requirements.md, design.md, tasks.md, research.md, validation reports) MUST be written in the target language configured for this specification (see spec.json.language).',
  it: '- Think in English, generate responses in Italian. All Markdown content written to project files (e.g., requirements.md, design.md, tasks.md, research.md, validation reports) MUST be written in the target language configured for this specification (see spec.json.language).',
  ko: '- Think in English, generate responses in Korean. All Markdown content written to project files (e.g., requirements.md, design.md, tasks.md, research.md, validation reports) MUST be written in the target language configured for this specification (see spec.json.language).',
  ar: '- Think in English, generate responses in Arabic. All Markdown content written to project files (e.g., requirements.md, design.md, tasks.md, research.md, validation reports) MUST be written in the target language configured for this specification (see spec.json.language).',
};

export const getDevGuidelines = (lang: SupportedLanguage): string => guidelinesMap[lang];

export const createTemplateContext = (
  lang: SupportedLanguage,
  kiroDir: string,
  layout: AgentLayout,
): TemplateContext => ({
  LANG_CODE: lang,
  DEV_GUIDELINES: getDevGuidelines(lang),
  KIRO_DIR: kiroDir,
  AGENT_DIR: layout.agentDir,
  AGENT_DOC: layout.docFile,
  AGENT_COMMANDS_DIR: layout.commandsDir,
});

export const buildTemplateContext = (opts: BuildTemplateContextOptions): TemplateContext => {
  const kiro = resolveKiroDir(opts.kiroDir ?? {});
  const layout = resolveAgentLayout(opts.agent, opts.config);
  return createTemplateContext(opts.lang, kiro, layout);
};
