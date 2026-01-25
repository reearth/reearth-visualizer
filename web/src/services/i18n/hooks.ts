import { useTranslation } from "react-i18next";

export const useT = () => useTranslation().t;
export const useLang = () => useTranslation().i18n.language;
export const useChangeLanguage = () => useTranslation().i18n.changeLanguage;
