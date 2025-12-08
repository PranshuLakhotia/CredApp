export const locales = [
  // International languages
  'en', 'es', 'fr', 'de',
  // Indian languages (22 scheduled languages)
  'hi',  // Hindi
  'as',  // Assamese
  'bn',  // Bengali
  'brx', // Bodo
  'doi', // Dogri
  'gu',  // Gujarati
  'kn',  // Kannada
  'ks',  // Kashmiri
  'kok', // Konkani
  'mai', // Maithili
  'ml',  // Malayalam
  'mni', // Manipuri
  'mr',  // Marathi
  'ne',  // Nepali
  'or',  // Odia
  'pa',  // Punjabi
  'sa',  // Sanskrit
  'sat', // Santhali
  'sd',  // Sindhi
  'ta',  // Tamil
  'te',  // Telugu
  'ur'   // Urdu
] as const;
export type Locale = (typeof locales)[number];
