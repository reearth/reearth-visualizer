import { ThemeProvider } from "@emotion/react";
import { ReactNode } from "react";

import GlobalStyle from "./reearthTheme/common/globalStyles";
import theme from "./reearthTheme/darkTheme";

const Provider: React.FC<{ children?: ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      {children}
    </ThemeProvider>
  );
};

export default Provider;
