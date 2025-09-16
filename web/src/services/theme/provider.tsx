import { ThemeProvider } from "@emotion/react";
import { useAuth } from "@reearth/services/auth";
import { Theme } from "@reearth/services/gql";
import { useCurrentTheme } from "@reearth/services/state";
import { ReactNode, useEffect } from "react";

import { useMe } from "../api/user";

import GlobalStyle from "./reearthTheme/common/globalStyles";
import darkTheme from "./reearthTheme/darkTheme";
import lightTheme from "./reearthTheme/lightTheme";

const Provider: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [, setThemeType] = useCurrentTheme();
  const { me } = useMe({ skip: !isAuthenticated });
  const themeType = me?.theme;
  // TODO: switch theme by the system settings
  const actualThemeType = themeType === ("light" as Theme) ? "light" : "dark";

  useEffect(() => {
    setThemeType(actualThemeType);
  }, [actualThemeType, setThemeType]);

  const theme = actualThemeType === "light" ? lightTheme : darkTheme;

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      {children}
    </ThemeProvider>
  );
};

export default Provider;
