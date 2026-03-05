/**
 * @copyright 2026 Jouni Sipola by OQM
 * @description i18n initialisation using i18next and react-i18next.
 *   Supports English (default) and Finnish.
 *   See locales/en.json and locales/fi.json for translation keys.
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../locales/en.json';
import fi from '../locales/fi.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fi: { translation: fi },
    },
    lng: navigator.language.startsWith('fi') ? 'fi' : 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export { i18n };
