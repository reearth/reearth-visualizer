import { ThemeProvider } from "@emotion/react";
import { ReactNode, useEffect } from "react";

import { Theme, useGetThemeQuery } from "@reearth/gql";
import { useAuth } from "@reearth/services/auth";
import { useCurrentTheme } from "@reearth/services/state";

import darkTheme from "./darkTheme";
import GlobalStyle from "./globalstyle";
import lightTheme from "./lightheme";

const Provider: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [, setThemeType] = useCurrentTheme();
  const { data } = useGetThemeQuery({ skip: !isAuthenticated });
  const themeType = data?.me?.theme;
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
