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
import searchNO from './locales/no/search.json';
import searchEN from './locales/en/search.json';
import aiNO from './locales/no/ai.json';
import aiEN from './locales/en/ai.json';
import adminNO from './locales/no/admin.json';
import adminEN from './locales/en/admin.json';
import authNO from './locales/no/auth.json';
import authEN from './locales/en/auth.json';
import homeNO from './locales/no/home.json';
import homeEN from './locales/en/home.json';
import uploadNO from './locales/no/upload.json';
import uploadEN from './locales/en/upload.json';
import navNO from './locales/no/nav.json';
import navEN from './locales/en/nav.json';

const resources = {
  no: {
    translation: translationNO,
    security: securityNO,
    albums: albumsNO,
    common: commonNO,
    search: searchNO,
    ai: aiNO,
    admin: adminNO,
    auth: authNO,
    home: homeNO,
    upload: uploadNO,
    nav: navNO
  },
  en: {
    translation: translationEN,
    security: securityEN,
    albums: albumsEN,
    common: commonEN,
    search: searchEN,
    ai: aiEN,
    admin: adminEN,
    auth: authEN,
    home: homeEN,
    upload: uploadEN,
    nav: navEN
  }
};

i18n
  .use(LanguageDetector) // Automatisk språkdeteksjon
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en', // Fallback hvis språk ikke finnes
    defaultNS: 'translation',
    ns: ['translation', 'security', 'albums', 'common', 'search', 'ai', 'admin', 'auth', 'home', 'upload', 'nav'],
    
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
