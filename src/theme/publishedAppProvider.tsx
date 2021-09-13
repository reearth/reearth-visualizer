import { ThemeProvider } from "@emotion/react";
import React from "react";

import theme from "./darkTheme";
import GlobalStyle from "./globalstyle";

const Provider: React.FC = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      {children}
    </ThemeProvider>
  );
};

export default Provider;
