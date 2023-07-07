import dayjs from "dayjs";
import { ReactNode, useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import "dayjs/locale/ja";

import { useAuth } from "@reearth/services/auth";
import { useGetMeQuery } from "@reearth/services/gql";

import i18n from "./i18n";

export default function Provider({ children }: { children?: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { data } = useGetMeQuery({ skip: !isAuthenticated });
  const locale = data?.me?.lang;

  dayjs.locale(locale);

  useEffect(() => {
    i18n.changeLanguage(locale === "und" ? undefined : locale);
  }, [locale]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
