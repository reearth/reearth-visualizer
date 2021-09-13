import { createIntl, createIntlCache } from "react-intl";

import en from "../../translations/en.yml";
import ja from "../../translations/ja.yml";

export const locales = ["en", "ja"] as const;

export type Locale = typeof locales[number];

export const locale = navigator.language.split("_")[0];

export const defaultLocale = locales.includes(locale as Locale) ? (locale as Locale) : "en";

export const messages = { en, ja } as Record<string, any>;

const cache = createIntlCache();

export const intl = createIntl(
  {
    locale: defaultLocale,
    messages: messages[defaultLocale],
  },
  cache,
);
