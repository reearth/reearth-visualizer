import { ThemeProvider } from "@emotion/react";
import { ReactNode, useEffect } from "react";

import classicDarkTheme from "@reearth/classic/theme/reearthTheme/darkTheme"; // temp classic imports
import classicLightTheme from "@reearth/classic/theme/reearthTheme/lightTheme"; // temp classic imports
import { useAuth } from "@reearth/services/auth";
import { Theme } from "@reearth/services/gql";
import { useCurrentTheme } from "@reearth/services/state";

import { useMeFetcher } from "../api";

import GlobalStyle from "./reearthTheme/common/globalStyles";
import darkTheme from "./reearthTheme/darkTheme";
import lightTheme from "./reearthTheme/lightTheme";

const Provider: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [, setThemeType] = useCurrentTheme();
  const { useMeQuery } = useMeFetcher();
  const { me } = useMeQuery({ skip: !isAuthenticated });
  const themeType = me?.theme;
  // TODO: switch theme by the system settings
  const actualThemeType = themeType === ("light" as Theme) ? "light" : "dark";

  useEffect(() => {
    setThemeType(actualThemeType);
  }, [actualThemeType, setThemeType]);

  const theme =
    actualThemeType === "light"
      ? {
          classic: classicLightTheme,
          ...lightTheme,
        }
      : {
          classic: classicDarkTheme,
          ...darkTheme,
        };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      {children}
    </ThemeProvider>
  );
};

export default Provider;
