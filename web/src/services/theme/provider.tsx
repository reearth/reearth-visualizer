import { ThemeProvider } from "@emotion/react";
import { useAuth } from "@reearth/services/auth";
import { Theme } from "@reearth/services/gql";
import { useCurrentTheme } from "@reearth/services/state";
import { ReactNode, useEffect } from "react";

import { useMeFetcher, useCerbosFetcher } from "../api";

import GlobalStyle from "./reearthTheme/common/globalStyles";
import darkTheme from "./reearthTheme/darkTheme";
import lightTheme from "./reearthTheme/lightTheme";

const Provider: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [, setThemeType] = useCurrentTheme();
  const { useMeQuery } = useMeFetcher();
  const { me } = useMeQuery({ skip: !isAuthenticated });
  const themeType = me?.theme;
  console.log(me);
  // TODO: switch theme by the system settings
  const actualThemeType = themeType === ("light" as Theme) ? "light" : "dark";

  useEffect(() => {
    setThemeType(actualThemeType);
  }, [actualThemeType, setThemeType]);

  const theme = actualThemeType === "light" ? lightTheme : darkTheme;

  const { checkPermission, data, loading, error } = useCerbosFetcher();

  useEffect(() => {
    checkPermission("dashboard", "read");
  }, [checkPermission]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  console.log(data?.checkPermission?.allowed);

  if (!data?.checkPermission?.allowed) {
    return <div>権限がありません。</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      {children}
    </ThemeProvider>
  );
};

export default Provider;
