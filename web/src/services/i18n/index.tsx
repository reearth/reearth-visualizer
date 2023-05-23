import { useTranslation } from "react-i18next";

export { useTranslation } from "react-i18next";
export { default as Provider } from "./provider";
export { default as PublishedProvider } from "./publishedProvider";
export { localesWithLabel } from "./locale";

export const useT = () => useTranslation().t;
export const useLang = () => useTranslation().i18n.language;
