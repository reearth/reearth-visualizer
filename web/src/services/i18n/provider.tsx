import { useAuth } from "@reearth/services/auth";
import dayjs from "dayjs";
import { ReactNode, useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import "dayjs/locale/ja";

import { useMe } from "../api/user";

import i18n from "./i18n";

export default function Provider({ children }: { children?: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { me } = useMe({ skip: !isAuthenticated });
  const locale = me?.lang;

  dayjs.locale(locale);

  useEffect(() => {
    i18n.changeLanguage(locale === "und" ? undefined : locale);
  }, [locale]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
