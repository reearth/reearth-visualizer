import { ThemeProvider } from "@emotion/react";
import React from "react";

import { useAuth } from "@reearth/auth";
import { Theme, useThemeQuery } from "@reearth/gql";

import darkTheme from "./darkTheme";
import GlobalStyle from "./globalstyle";
import lightTheme from "./lightheme";

const Provider: React.FC = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { data } = useThemeQuery({ skip: !isAuthenticated });

  const theme = data?.me?.theme === ("light" as Theme) ? lightTheme : darkTheme;
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      {children}
    </ThemeProvider>
  );
};

export default Provider;
