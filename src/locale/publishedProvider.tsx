import React, { PropsWithChildren } from "react";
import { IntlProvider } from "react-intl";

import { defaultLocale, messages } from "./locale";

const locale = navigator.language.split("_")[0];

export default function PublishedProvider({ children }: PropsWithChildren<{}>) {
  return (
    <IntlProvider locale={locale} defaultLocale={defaultLocale} messages={messages[locale]}>
      {children}
    </IntlProvider>
  );
}
