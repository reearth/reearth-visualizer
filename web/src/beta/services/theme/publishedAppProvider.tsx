import { ThemeProvider } from "@emotion/react";
import { ReactNode } from "react";

import theme from "./darkTheme";
import GlobalStyle from "./globalstyle";

const Provider: React.FC<{ children?: ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      {children}
    </ThemeProvider>
  );
};

export default Provider;
