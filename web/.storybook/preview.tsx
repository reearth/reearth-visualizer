import { ThemeProvider } from "@emotion/react";
import type { Preview } from "@storybook/react";
import { I18nextProvider } from "react-i18next";

import i18n from "../src/services/i18n/i18n";
import { GlobalStyles, darkTheme, lightTheme } from "../src/services/theme";

// Mock I18nProvider for Storybook
// The real I18nProvider uses Apollo Client hooks (useMe) which aren't needed for component stories
const MockI18nProvider = ({ children }: { children: React.ReactNode }) => {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};

const preview: Preview = {
  parameters: {
    backgrounds: {
      values: [
        { name: "Light", value: "lightGrey" },
        { name: "Dark", value: "ash" }
      ]
    },
    layout: "fullscreen",
    controls: { expanded: true }
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || "dark";
      const currentTheme = theme === "light" ? lightTheme : darkTheme;

      return (
        <ThemeProvider theme={currentTheme}>
          <GlobalStyles />
          <MockI18nProvider>
            <Story />
          </MockI18nProvider>
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
