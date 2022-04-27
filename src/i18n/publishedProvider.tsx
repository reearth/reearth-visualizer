import React, { ReactNode } from "react";
import { I18nextProvider } from "react-i18next";

import i18n from "./i18n";
import { PublishedProvider as LegacyProvider } from "./legacy";

export default function PublishedProvider({ children }: { children?: ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <LegacyProvider>{children}</LegacyProvider>
    </I18nextProvider>
  );
}
