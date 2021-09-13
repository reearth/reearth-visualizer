import React, { PropsWithChildren } from "react";
import { IntlProvider } from "react-intl";

import { useAuth } from "@reearth/auth";
import { useLanguageQuery } from "@reearth/gql";

import { Locale, defaultLocale, locales, messages } from "./locale";

export default function Provider({ children }: PropsWithChildren<{}>) {
  const { isAuthenticated } = useAuth();
  const { data } = useLanguageQuery({ skip: !isAuthenticated });
  const locale =
    data?.me?.lang && locales.includes(data.me.lang as Locale) ? data.me.lang : defaultLocale;

  return (
    <IntlProvider locale={locale} defaultLocale={defaultLocale} messages={messages[locale]}>
      {children}
    </IntlProvider>
  );
}
