import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@reearth/auth";
import { useLang as useCurrentLang } from "@reearth/i18n";
import {
  NotificationType,
  useCurrentTheme as useCurrentTheme,
  useNotification,
} from "@reearth/state";

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
          show
          onNotificationChange={handleNotificationChange}
        />
      ))}
    </>
  );
};

export default GlobalModal;
