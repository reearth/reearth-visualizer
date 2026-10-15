import NotificationBanner from "@reearth/app/features/Notification";
import PluginPlaygroundDevViewer from "@reearth/app/features/PluginPlayground/DevViewer";

import { PublishedProvider as I18nProvider } from "./services/i18n";
import { PublishedAppProvider as ThemeProvider } from "./services/theme";

// No auth or GraphQL: the published providers don't depend on the user.
export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <NotificationBanner />
        <PluginPlaygroundDevViewer />
      </I18nProvider>
    </ThemeProvider>
  );
}
