import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import en from "./translations/en.yml";
import ja from "./translations/ja.yml";

const resources = {
  en: {
    translation: en
  },
  ja: {
    translation: ja
  }
};

export const availableLanguages = Object.keys(resources);

// src/services/i18n/config.ts
export const SUPPORTED_LANGUAGES = {
  en: { label: "English", value: "en" },
  ja: { label: "日本語", value: "ja" }
} as const;

i18n.use(LanguageDetector).use(initReactI18next).init({
  supportedLngs: availableLanguages,
  resources,
  fallbackLng: "en",
  // allow keys to be phrases having `:`, `.`
  nsSeparator: false,
  keySeparator: false,
  returnEmptyString: false,
  returnNull: false
});

export default i18n;
