export const supportedLanguages = [
  'ja',
  'en',
  'zh-TW',
  'zh',
  'es',
  'pt',
  'de',
  'fr',
  'ru',
  'it',
  'ko',
  'ar',
] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];
