/**
 * Workbench App - Minimal providers for standalone viewer
 *
 * The Workbench mounts NO Auth, GraphQL, Restful, or Router providers.
 * It reuses the Published theme and i18n providers as they are lightweight
 * and have no external dependencies.
 */

import WorkbenchPage from "@reearth/app/pages/WorkbenchPage";

import { PublishedProvider as I18nProvider } from "./services/i18n";
import { PublishedAppProvider as ThemeProvider } from "./services/theme";

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <WorkbenchPage />
      </I18nProvider>
    </ThemeProvider>
  );
}
