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
  'vi',
] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];
