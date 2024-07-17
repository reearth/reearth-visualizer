import { ThemeProvider } from "@emotion/react";
import { ReactNode } from "react";

import GlobalStyle from "./reearthTheme/common/globalStyles";
import darkTheme from "./reearthTheme/darkTheme";
import lightTheme from "./reearthTheme/lightTheme";

const Provider: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const theme = {
    ...lightTheme,
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
