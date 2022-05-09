import React, { ReactNode } from "react";
import { IntlProvider } from "react-intl";

import { useAuth } from "@reearth/auth";
import { useGetLanguageQuery } from "@reearth/gql";

import { Locale, defaultLocale, locales, messages } from "./locale";

export default function Provider({ children }: { children?: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { data } = useGetLanguageQuery({ skip: !isAuthenticated });
  const locale =
    data?.me?.lang && locales.includes(data.me.lang as Locale) ? data.me.lang : defaultLocale;

  return (
    <IntlProvider locale={locale} defaultLocale={defaultLocale} messages={messages[locale]}>
      {children}
    </IntlProvider>
  );
}
