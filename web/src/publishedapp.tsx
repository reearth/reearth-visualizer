import PublishedPage from "@reearth/classic/components/pages/Published";

import { PublishedProvider as I18nProvider } from "./services/i18n";
import { PublishedAppProvider as ThemeProvider } from "./services/theme";
import { Provider as DndProvider } from "./util/use-dnd";

export default function App() {
  return (
    <ThemeProvider>
      <DndProvider>
        <I18nProvider>
          <PublishedPage />
        </I18nProvider>
      </DndProvider>
    </ThemeProvider>
  );
}
