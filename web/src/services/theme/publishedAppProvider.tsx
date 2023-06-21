import { ThemeProvider } from "@emotion/react";
import { ReactNode } from "react";

import classicTheme from "@reearth/classic/theme/reearthTheme/darkTheme";

import GlobalStyle from "./reearthTheme/common/globalStyles";
import betaTheme from "./reearthTheme/darkTheme";

const Provider: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const theme = {
    classic: classicTheme,
    ...betaTheme,
  };
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      {children}
    </ThemeProvider>
  );
};

export default Provider;
