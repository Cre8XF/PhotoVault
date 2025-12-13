// ============================================================================
// i18n configuration – FASE 3.5: Flerspråklig støtte
// ============================================================================
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import translations
import translationNO from './locales/no/translation.json'
import translationEN from './locales/en/translation.json'

import securityNO from './locales/no/security.json'
import securityEN from './locales/en/security.json'

import albumsNO from './locales/no/albums.json'
import albumsEN from './locales/en/albums.json'

import commonNO from './locales/no/common.json'
import commonEN from './locales/en/common.json'

import searchNO from './locales/no/search.json'
import searchEN from './locales/en/search.json'

import aiNO from './locales/no/ai.json'
import aiEN from './locales/en/ai.json'

import adminNO from './locales/no/admin.json'
import adminEN from './locales/en/admin.json'

import authNO from './locales/no/auth.json'
import authEN from './locales/en/auth.json'

import homeNO from './locales/no/home.json'
import homeEN from './locales/en/home.json'

import uploadNO from './locales/no/upload.json'
import uploadEN from './locales/en/upload.json'

import navNO from './locales/no/nav.json'
import navEN from './locales/en/nav.json'

import collageNO from './locales/no/collage.json'
import collageEN from './locales/en/collage.json'

import timelineNO from './locales/no/timeline.json'
import timelineEN from './locales/en/timeline.json'

// ⭐ NEW: Profile translations
import profileNO from './locales/no/profile.json'
import profileEN from './locales/en/profile.json'

import infoNO from './locales/no/info.json'
import infoEN from './locales/en/info.json'

// ⭐ Phase 2.1 & 2.2: Core UI Components translations
import tipsNO from './locales/no/tips.json'
import tipsEN from './locales/en/tips.json'

import activityNO from './locales/no/activity.json'
import activityEN from './locales/en/activity.json'

import statsNO from './locales/no/stats.json'
import statsEN from './locales/en/stats.json'

import storageNO from './locales/no/storage.json'
import storageEN from './locales/en/storage.json'

import emptyNO from './locales/no/empty.json'
import emptyEN from './locales/en/empty.json'

import settingsNO from './locales/no/settings.json'
import settingsEN from './locales/en/settings.json'

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
    nav: navNO,
    collage: collageNO,
    timeline: timelineNO,
    profile: profileNO,
    info: infoNO,
    tips: tipsNO,
    activity: activityNO,
    stats: statsNO,
    storage: storageNO,
    empty: emptyNO,
    settings: settingsNO,
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
    nav: navEN,
    collage: collageEN,
    timeline: timelineEN,
    profile: profileEN,
    info: infoEN,
    tips: tipsEN,
    activity: activityEN,
    stats: statsEN,
    storage: storageEN,
    empty: emptyEN,
    settings: settingsEN,
  },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'translation',
    ns: [
      'translation',
      'security',
      'albums',
      'common',
      'search',
      'ai',
      'admin',
      'auth',
      'home',
      'upload',
      'nav',
      'collage',
      'timeline',
      'profile',
      'info',
      'tips',
      'activity',
      'stats',
      'storage',
      'empty',
      'settings',
    ],

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'photoVaultLanguage',
    },

    react: {
      useSuspense: false,
    },
  })

export default i18n
