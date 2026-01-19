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
  'el',
] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];
