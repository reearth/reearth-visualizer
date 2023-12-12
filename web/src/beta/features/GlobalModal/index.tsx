import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@reearth/services/auth";
import { config } from "@reearth/services/config";
import { useLang as useCurrentLang } from "@reearth/services/i18n";
import {
  NotificationType,
  useCurrentTheme as useCurrentTheme,
  useNotification,
} from "@reearth/services/state";

const GlobalModal: React.FC = () => {
  const extensions = config()?.extensions?.globalModal;

  const { getAccessToken, logout } = useAuth();
  const currentLang = useCurrentLang();
  const [currentTheme] = useCurrentTheme();
  const [, setNotification] = useNotification();

  const [accessToken, setAccessToken] = useState<string>();

  useEffect(() => {
    if (accessToken) return;
    getAccessToken().then(token => {
      setAccessToken(token);
    });
  }, [accessToken, getAccessToken]);

  const handleNotificationChange = useCallback(
    (type: NotificationType, text: string, heading?: string) =>
      setNotification({ type, text, heading }),
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
