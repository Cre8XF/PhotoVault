// ============================================================================
// i18n configuration - FASE 3.5: Flerspråklig støtte
// ============================================================================
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import translationNO from './locales/no/translation.json';
import translationEN from './locales/en/translation.json';
import securityNO from './locales/no/security.json';
import securityEN from './locales/en/security.json';
import albumsNO from './locales/no/albums.json';
import albumsEN from './locales/en/albums.json';
import commonNO from './locales/no/common.json';
import commonEN from './locales/en/common.json';

const resources = {
  no: {
    translation: translationNO,
    security: securityNO,
    albums: albumsNO,
    common: commonNO
  },
  en: {
    translation: translationEN,
    security: securityEN,
    albums: albumsEN,
    common: commonEN
  }
};

i18n
  .use(LanguageDetector) // Automatisk språkdeteksjon
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en', // Fallback hvis språk ikke finnes
    defaultNS: 'translation',
    ns: ['translation', 'security', 'albums', 'common'],
    
    interpolation: {
      escapeValue: false // React escaper allerede
    },
    
    detection: {
      // Prøv localStorage først, deretter browser-språk
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'photoVaultLanguage'
    },
    
    react: {
      useSuspense: false // Unngå suspense for enklere håndtering
    }
  });

export default i18n;
