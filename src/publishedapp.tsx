import React from "react";

import { PublishedAppProvider as ThemeProvider } from "./theme";
import { PublishedProvider as IntlProvider } from "./locale";
import { Provider as DndProvider } from "./util/use-dnd";

import PublishedPage from "@reearth/components/pages/Published";

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
