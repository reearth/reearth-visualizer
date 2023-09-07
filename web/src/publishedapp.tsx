import PublishPage from "./beta/pages/PublishPage";
import PublishedPage from "./classic/components/pages/Published";
import { Provider as DndProvider } from "./classic/util/use-dnd";
import { PublishedProvider as I18nProvider } from "./services/i18n";
import { PublishedAppProvider as ThemeProvider } from "./services/theme";

export default function App() {
  const checkMode = window.REEARTH_CONFIG?.developerMode;
  return (
    <ThemeProvider>
      <DndProvider>
        <I18nProvider>{checkMode ? <PublishPage /> : <PublishedPage />}</I18nProvider>
      </DndProvider>
    </ThemeProvider>
  );
}
