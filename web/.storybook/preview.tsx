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
import React from "react";

import classicDarkTheme from "../src/classic/theme/reearthTheme/darkTheme"; // temp classic imports
import classicLightTheme from "../src/classic/theme/reearthTheme/lightTheme"; // temp classic imports
import { Provider as DndProvider } from "../src/classic/util/use-dnd";
import { Provider as I18nProvider } from "../src/services/i18n";
import { GlobalStyles, darkTheme, lightTheme } from "../src/services/theme";

import theme from "./theme";

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
    docs: {
      theme,
    },
  },
  decorators: [
    withThemeFromJSXProvider({
      themes: {
        light: {
          classic: classicLightTheme,
          ...lightTheme,
        },
        dark: {
          classic: classicDarkTheme,
          ...darkTheme,
        },
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
