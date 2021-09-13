import React from "react";

import PublishedPage from "@reearth/components/pages/Published";

import { PublishedProvider as IntlProvider } from "./locale";
import { PublishedAppProvider as ThemeProvider } from "./theme";
import { Provider as DndProvider } from "./util/use-dnd";

export default function App() {
  return (
    <ThemeProvider>
      <DndProvider>
        <IntlProvider>
          <PublishedPage />
        </IntlProvider>
      </DndProvider>
    </ThemeProvider>
  );
}
