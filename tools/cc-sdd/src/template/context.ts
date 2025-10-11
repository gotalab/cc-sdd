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
  en: '- Think in English, generate responses in English',
  ja: '- Think in English, but generate responses in Japanese (思考は英語、回答の生成は日本語で行うように)',
  'zh-TW': '- 以英文思考，但以繁體中文生成回應（Think in English, generate in Traditional Chinese）',
  zh: '- 以英文思考，但以简体中文生成回复（Think in English, generate in Simplified Chinese）',
  es: '- Think in English, generate responses in Spanish (Piensa en inglés, genera respuestas en español)',
  pt: '- Think in English, generate responses in Portuguese (Pense em inglês, gere respostas em português)',
  de: '- Think in English, generate responses in German (Denke auf Englisch, formuliere Antworten auf Deutsch)',
  fr: '- Think in English, generate responses in French (Pensez en anglais, générez des réponses en français)',
  ru: '- Think in English, generate responses in Russian (Думай по-английски, отвечай по-русски)',
  it: '- Think in English, generate responses in Italian (Pensa in inglese, genera risposte in italiano)',
  ko: '- Think in English, generate responses in Korean (영어로 사고하고, 한국어로 응답을 생성하세요)',
  ar: '- Think in English, generate responses in Arabic (فكر بالإنجليزية وأجب بالعربية)',
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
