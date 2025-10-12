import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ptBR from './locales/pt-BR.json';
import es from './locales/es.json';

// Initialize i18n only once
if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    compatibilityJSON: 'v3',
    resources: {
      'pt-BR': {
        translation: ptBR,
      },
      es: {
        translation: es,
      },
    },
    lng: 'pt-BR',
    fallbackLng: 'pt-BR',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false, // Disable suspense to avoid blocking
    },
    // Cache translations
    cache: {
      enabled: true,
    },
  });
}

export default i18n;
