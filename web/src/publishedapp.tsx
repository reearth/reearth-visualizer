import PublishPage from "./beta/pages/PublishPage";
import { Provider as DndProvider } from "./classic/util/use-dnd";
import { PublishedProvider as I18nProvider } from "./services/i18n";
import { PublishedAppProvider as ThemeProvider } from "./services/theme";

export default function App() {
  return (
    <ThemeProvider>
      <DndProvider>
        <I18nProvider>
          {/* <PublishedPage /> */}
          <PublishPage alias="ddfcicifad" />
        </I18nProvider>
      </DndProvider>
    </ThemeProvider>
  );
}
