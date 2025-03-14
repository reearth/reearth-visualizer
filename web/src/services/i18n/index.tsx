import { useTranslation } from "react-i18next";

export { SUPPORTED_LANGUAGES } from "./i18n";
export { useTranslation } from "react-i18next";
export { default as Provider } from "./provider";
export { default as PublishedProvider } from "./publishedProvider";
export { localesWithLabel } from "./locale";

export const useT = () => useTranslation().t;
export const useLang = () => useTranslation().i18n.language;
export const useChangeLanguage = () => useTranslation().i18n.changeLanguage;
