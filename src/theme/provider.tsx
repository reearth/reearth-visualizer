import { ThemeProvider } from "@emotion/react";
import React, { useEffect } from "react";

import { useAuth } from "@reearth/auth";
import { Theme, useGetThemeQuery } from "@reearth/gql";
import { useCurrentTheme } from "@reearth/state";

import darkTheme from "./darkTheme";
import GlobalStyle from "./globalstyle";
import lightTheme from "./lightheme";

const Provider: React.FC = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [, setThemaType] = useCurrentTheme();
  const { data } = useGetThemeQuery({ skip: !isAuthenticated });
  const themeType = data?.me?.theme;
  // TODO: switch theme by the system settings
  const actualThemeType = themeType === ("light" as Theme) ? "light" : "dark";

  useEffect(() => {
    setThemaType(actualThemeType);
  }, [actualThemeType, setThemaType]);

  const theme = actualThemeType === "light" ? lightTheme : darkTheme;

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      {children}
    </ThemeProvider>
  );
};

export default Provider;
