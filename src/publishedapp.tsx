import React from "react";

import { Provider as ThemeProvider } from "./theme";
import { Provider as LocalStateProvider } from "./state";
import { PublishedProvider as IntlProvider } from "./locale";

import PublishedPage from "@reearth/components/pages/Published";

export default function App() {
  return (
    <ThemeProvider>
      <LocalStateProvider>
        <IntlProvider>
          <PublishedPage />
        </IntlProvider>
      </LocalStateProvider>
    </ThemeProvider>
  );
}
