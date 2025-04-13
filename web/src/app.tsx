import GlobalModal from "@reearth/beta/features/GlobalModal";
import NotificationBanner from "@reearth/beta/features/Notification";
import { Provider as I18nProvider } from "@reearth/services/i18n";
import { Suspense } from "react";

import { Loading } from "./beta/lib/reearth-ui";
import { AuthProvider } from "./services/auth";
import { Provider as GqlProvider } from "./services/gql";
import { RestfulProvider } from "./services/restful";
import { AppRoutes } from "./services/routing";
import { Provider as ThemeProvider } from "./services/theme";

export default function App() {
  return (
    <AuthProvider>
      <GqlProvider>
        <RestfulProvider>
          <ThemeProvider>
            <I18nProvider>
              <Suspense fallback={<Loading includeLogo />}>
                <NotificationBanner />
                <GlobalModal />
                <AppRoutes />
              </Suspense>
            </I18nProvider>
          </ThemeProvider>
        </RestfulProvider>
      </GqlProvider>
    </AuthProvider>
  );
}
