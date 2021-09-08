import React, { ReactElement } from "react";
import {
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  Observable,
} from "@apollo/client";

import { Provider as ThemeProvider } from "../src/theme";
import { Provider as IntlProvider } from "../src/locale";
import { Provider as DndProvider } from "../src/util/use-dnd";

// apollo client that does nothing
const mockClient = new ApolloClient({
  link: new ApolloLink(
    () =>
      new Observable(observer => {
        observer.complete();
      }),
  ),
  cache: new InMemoryCache(),
});

export const parameters = {
  layout: "fullscreen",
  controls: { expanded: true },
};

export const decorators = [
  (storyFn: () => ReactElement) => (
    <ApolloProvider client={mockClient}>
      <ThemeProvider>
        <IntlProvider>
          <DndProvider>{storyFn()}</DndProvider>
        </IntlProvider>
      </ThemeProvider>
    </ApolloProvider>
  ),
];
