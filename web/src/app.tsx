import { Suspense } from "react";

import Loading from "@reearth/classic/components/atoms/Loading";
import NotificationBanner from "@reearth/classic/components/organisms/Notification";
import { Provider as I18nProvider } from "@reearth/services/i18n";

import { Provider as Auth0Provider } from "./services/auth";
import { Provider as GqlProvider } from "./services/gql";
import { AppRoutes } from "./services/routing";
import { Provider as ThemeProvider } from "./services/theme";

export default function App() {
  return (
    <Auth0Provider>
      <GqlProvider>
        <ThemeProvider>
          <I18nProvider>
            <Suspense fallback={<Loading />}>
              <NotificationBanner />
              <AppRoutes />
            </Suspense>
          </I18nProvider>
        </ThemeProvider>
      </GqlProvider>
    </Auth0Provider>
  );
}
