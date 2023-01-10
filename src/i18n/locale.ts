import { availableLanguages } from "./i18n";

export const localesWithLabel: { [l in (typeof availableLanguages)[number]]: string } = {
  en: "English",
  ja: "日本語",
};
