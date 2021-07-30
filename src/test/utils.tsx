import React from "react";
import { render as rtlRender } from "@testing-library/react";
import { Provider as IntlProvider } from "../locale";
import { Provider as ThemeProvider } from "../theme";
import { MockedProvider as MockedGqlProvider, MockedResponse } from "@apollo/client/testing";
import { LANGUAGE } from "@reearth/locale/queries";

const queryMocks: readonly MockedResponse<Record<string, any>>[] | undefined = [
  {
    request: {
      query: LANGUAGE,
      variables: {},
    },
    result: {
      data: {
        me: {
          id: "whatever",
          name: "mock",
          email: "mock@example.com",
          lang: "en",
          myTeam: { id: "whatever", name: "sample", __typename: "Team" },
          auths: ["auth0"],
          __typename: "User",
        },
      },
    },
  },
];
const render = (ui: React.ReactElement, { ...renderOptions } = {}) => {
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
