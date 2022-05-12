import { useTranslation } from "react-i18next";

export { useTranslation } from "react-i18next";
export { default as Provider } from "./provider";
export { default as PublishedProvider } from "./publishedProvider";

// eslint-disable-next-line react-hooks/rules-of-hooks
export const useT = () => useTranslation().t;
