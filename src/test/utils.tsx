import { MockedProvider as MockedGqlProvider, MockedResponse } from "@apollo/client/testing";
import { render as rtlRender } from "@testing-library/react";

import { Provider as I18nProvider } from "../i18n";
import { Provider as ThemeProvider } from "../theme";

const render = (
  ui: React.ReactElement,
  queryMocks?: readonly MockedResponse<Record<string, any>>[],
  { ...renderOptions } = {},
) => {
  const Wrapper: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    return (
      <MockedGqlProvider mocks={queryMocks} addTypename={false}>
        <ThemeProvider>
          <I18nProvider>{children}</I18nProvider>
        </ThemeProvider>
      </MockedGqlProvider>
    );
  };
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
};

// eslint-disable-next-line import/export
export * from "@testing-library/react";

// eslint-disable-next-line import/export
export { render };
