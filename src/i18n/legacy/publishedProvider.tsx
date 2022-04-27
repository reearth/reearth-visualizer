import React, { ReactNode } from "react";
import { IntlProvider } from "react-intl";

import { defaultLocale, messages } from "./locale";

const locale = navigator.language.split("_")[0];

export default function PublishedProvider({ children }: { children?: ReactNode }) {
  return (
    <IntlProvider locale={locale} defaultLocale={defaultLocale} messages={messages[locale]}>
      {children}
    </IntlProvider>
  );
}
