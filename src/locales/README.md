# Multilingual Support (i18n)

This directory contains translation files for multilingual support in the CredApp application.

## Supported Languages

The application currently supports 7 languages:

1. **English (en)** 🇬🇧 - Default language
2. **Hindi (hi)** 🇮🇳 - हिन्दी
3. **Tamil (ta)** 🇮🇳 - தமிழ்
4. **Telugu (te)** 🇮🇳 - తెలుగు
5. **Bengali (bn)** 🇮🇳 - বাংলা
6. **Marathi (mr)** 🇮🇳 - मराठी
7. **Gujarati (gu)** 🇮🇳 - ગુજરાતી

## File Structure

Each language has its own JSON file:
- `en.json` - English
- `hi.json` - Hindi
- `ta.json` - Tamil
- `te.json` - Telugu
- `bn.json` - Bengali
- `mr.json` - Marathi
- `gu.json` - Gujarati

## Translation Structure

Translations are organized into categories:

```json
{
  "common": { ... },        // Common UI elements
  "navigation": { ... },    // Navigation items
  "dashboard": { ... },     // Dashboard specific
  "credentials": { ... },   // Credential management
  "profile": { ... },       // User profile
  "accessibility": { ... }, // Accessibility features
  "language": { ... },      // Language settings
  "auth": { ... },          // Authentication
  "errors": { ... },        // Error messages
  "messages": { ... }       // Success/info messages
}
```

## Usage

### In React Components

```typescript
import { useLanguage } from '@/contexts/LanguageContext';

function MyComponent() {
  const { t, currentLanguage, setLanguage } = useLanguage();
  
  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <p>{t('dashboard.title')}</p>
    </div>
  );
}
```

### With Parameters

```typescript
// Translation: "Welcome, {{name}}!"
t('greeting', { name: 'John' })
// Output: "Welcome, John!"
```

### Nested Keys

```typescript
t('accessibility.description.textToSpeech')
// Output: "Read text aloud when hovering"
```

## Adding New Languages

1. Create a new JSON file with the language code (e.g., `kn.json` for Kannada)
2. Copy the structure from `en.json`
3. Translate all strings
4. Add the language to `SUPPORTED_LANGUAGES` in `LanguageContext.tsx`:

```typescript
{ code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' }
```

## Adding New Translation Keys

1. Add the key to `en.json` first
2. Add the same key to all other language files
3. Use the key in your component with `t('category.key')`

## Features

- ✅ **Persistent Storage** - Language preference saved in localStorage
- ✅ **Browser Detection** - Auto-detects browser language on first visit
- ✅ **Dynamic Loading** - Translations loaded on demand
- ✅ **Fallback Support** - Falls back to English if translation missing
- ✅ **Parameter Support** - Dynamic text with `{{param}}` placeholders
- ✅ **Nested Keys** - Dot notation for organized translations
- ✅ **Type-safe** - TypeScript support for language codes

## Language Switcher Components

### LanguageSwitcher (Header)
Icon button with dropdown menu showing all languages with flags.

### LanguageSelector (Forms)
Select dropdown for use in settings/forms.

## Best Practices

1. **Always use keys** - Never hardcode text strings
2. **Organize by category** - Keep related translations together
3. **Use descriptive keys** - `dashboard.totalCredentials` not `dash.tc`
4. **Consistent casing** - Use camelCase for keys
5. **Keep translations short** - Especially for UI labels
6. **Test all languages** - Ensure UI doesn't break with longer text

## Translation Guidelines

- **Be concise** - Mobile screens have limited space
- **Stay contextual** - Consider the UI context
- **Use formal tone** - Professional application
- **Maintain consistency** - Use same terms throughout
- **Test on mobile** - Ensure text fits in mobile layouts

## RTL Support (Future)

For right-to-left languages (future addition):
- Arabic, Urdu, etc. will need RTL layout support
- Add `dir="rtl"` to HTML element
- Mirror layouts and icons appropriately

