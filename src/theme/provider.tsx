import React from "react";
import { ThemeProvider } from "@emotion/react";

import darkTheme from "./darkTheme";
import lightTheme from "./lightheme";
import GlobalStyle from "./globalstyle";
import { Theme, useThemeQuery } from "@reearth/gql";
import { useAuth } from "@reearth/auth";

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
