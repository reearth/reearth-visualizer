import { ReactNode, useEffect } from "react";
import { I18nextProvider } from "react-i18next";

import { useAuth } from "@reearth/auth";
import { useGetLanguageQuery } from "@reearth/gql";

import i18n from "./i18n";

export default function Provider({ children }: { children?: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { data } = useGetLanguageQuery({ skip: !isAuthenticated });
  const locale = data?.me?.lang;

  useEffect(() => {
    i18n.changeLanguage(locale === "und" ? undefined : locale);
  }, [locale]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
