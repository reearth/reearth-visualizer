import React from "react";
import { render as rtlRender } from "@testing-library/react";
import { Provider as IntlProvider } from "../locale";
import { Provider as ThemeProvider } from "../theme";
import { MockedProvider as MockedGqlProvider, MockedResponse } from "@apollo/client/testing";

const render = (
  ui: React.ReactElement,
  queryMocks?: readonly MockedResponse<Record<string, any>>[],
  { ...renderOptions } = {},
) => {
  const Wrapper: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    return (
      <MockedGqlProvider mocks={queryMocks} addTypename={false}>
        <ThemeProvider>
          <IntlProvider>{children}</IntlProvider>
        </ThemeProvider>
      </MockedGqlProvider>
    );
  };
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
};

export * from "@testing-library/react";

export { render };
