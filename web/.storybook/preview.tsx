import {
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  Observable
} from "@apollo/client";
import { ThemeProvider } from "@emotion/react";
import type { Preview } from "@storybook/react";

import { Provider as I18nProvider } from "../src/services/i18n";
import { GlobalStyles, darkTheme, lightTheme } from "../src/services/theme";

// apollo client that does nothing
const mockClient = new ApolloClient({
  link: new ApolloLink(
    () =>
      new Observable((observer) => {
        observer.complete();
      })
  ),
  cache: new InMemoryCache()
});

const preview: Preview = {
  parameters: {
    backgrounds: {
      values: [
        { name: "Light", value: "lightGrey" },
        { name: "Dark", value: "ash" }
      ]
    },
    layout: "fullscreen",
    controls: { expanded: true },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || "dark";
      const currentTheme = theme === "light" ? lightTheme : darkTheme;

      return (
        <ThemeProvider theme={currentTheme}>
          <GlobalStyles />
          <ApolloProvider client={mockClient}>
            <I18nProvider>
              <Story />
            </I18nProvider>
          </ApolloProvider>
        </ThemeProvider>
      );
    }
  ],
  globalTypes: {
    theme: {
      description: "Global theme for components",
      defaultValue: "dark",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: ["light", "dark"],
        dynamicTitle: true
      }
    }
  }
};

export default preview;
