/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  Observable,
} from "@apollo/client";
import { ThemeProvider } from "@emotion/react";
import { withThemeFromJSXProvider } from "@storybook/addon-styling";
import type { Preview } from "@storybook/react";
import React, { ReactElement } from "react";
import { withRouter } from "storybook-addon-react-router-v6";

import { Provider as DndProvider } from "../src/classic/util/use-dnd";
import { Provider as I18nProvider } from "../src/services/i18n";
import { GlobalStyles, darkTheme, lightTheme } from "../src/services/theme";

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

const preview: Preview = {
  parameters: {
    backgrounds: {
      values: [
        { name: "Light", value: "lightGrey" },
        { name: "Dark", value: "ash" },
      ],
    },
    layout: "fullscreen",
    controls: { expanded: true },
    actions: { argTypesRegex: "^on.*" },
    reactRouter: {
      routePath: "/",
    },
  },
  decorators: [
    withRouter,
    withThemeFromJSXProvider({
      themes: {
        light: lightTheme,
        dark: darkTheme,
      },
      defaultTheme: "dark",
      Provider: ThemeProvider,
      GlobalStyles,
    }),
    Story => {
      return (
        <ApolloProvider client={mockClient}>
          <I18nProvider>
            <DndProvider>
              <Story />
            </DndProvider>
          </I18nProvider>
        </ApolloProvider>
      );
    },
  ],
};

export default preview;
