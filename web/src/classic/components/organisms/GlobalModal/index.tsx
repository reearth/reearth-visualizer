import { useCallback, useEffect, useState } from "react";

import {
  NotificationType,
  useCurrentTheme as useCurrentTheme,
  useNotification,
} from "@reearth/classic/state";
import { useAuth } from "@reearth/services/auth";
import { useLang as useCurrentLang } from "@reearth/services/i18n";

const GlobalModal: React.FC = () => {
  const extensions = window.REEARTH_CONFIG?.extensions?.globalModal;
  const { getAccessToken, logout } = useAuth();
  const currentLang = useCurrentLang();
  const [currentTheme] = useCurrentTheme();
  const [, setNotification] = useNotification();

  const [accessToken, setAccessToken] = useState<string>();

  useEffect(() => {
    getAccessToken().then(token => {
      setAccessToken(token);
    });
  }, [getAccessToken]);

  const handleNotificationChange = useCallback(
    (type: NotificationType, text: string, heading?: string) => {
      setNotification({ type, text, heading });
    },
    [setNotification],
  );

  return (
    <>
      {extensions?.map(ext => (
        <ext.component
          key={ext.id}
          lang={currentLang}
          theme={currentTheme}
          accessToken={accessToken}
          onLogOut={logout}
          onNotificationChange={handleNotificationChange}
        />
      ))}
    </>
  );
};

export default GlobalModal;
