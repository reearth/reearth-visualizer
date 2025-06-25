import PublishedPage from "@reearth/app/pages/PublishedPage";

import { PublishedProvider as I18nProvider } from "./services/i18n";
import { PublishedAppProvider as ThemeProvider } from "./services/theme";

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <PublishedPage />
      </I18nProvider>
    </ThemeProvider>
  );
}
