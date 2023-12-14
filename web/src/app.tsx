import { Suspense } from "react";

import Loading from "@reearth/beta/components/Loading";
import GlobalModal from "@reearth/beta/features/GlobalModal";
import NotificationBanner from "@reearth/beta/features/Notification";
import { Provider as I18nProvider } from "@reearth/services/i18n";

import { AuthProvider } from "./services/auth";
import { Provider as GqlProvider } from "./services/gql";
import { AppRoutes } from "./services/routing";
import { Provider as ThemeProvider } from "./services/theme";

export default function App() {
  return (
    <AuthProvider>
      <GqlProvider>
        <ThemeProvider>
          <I18nProvider>
            <Suspense fallback={<Loading animationSize={80} animationColor="#3B3CD0" />}>
              <NotificationBanner />
              <GlobalModal />
              <AppRoutes />
            </Suspense>
          </I18nProvider>
        </ThemeProvider>
      </GqlProvider>
    </AuthProvider>
  );
}
