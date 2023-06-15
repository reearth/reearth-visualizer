import commonTheme from "../common";
import commonColors from "../common/colors";
import lightColors from "../lightTheme/colors";
import type { Theme } from "../types";

import colors from "./colors";

const darkTheme: Theme = {
  ...commonTheme,
  colors: {
    ...commonColors,
    dark: { ...colors },
    light: { ...lightColors },
  },
  general: {
    brand: commonColors.brand.blue.strong,
    bg: {
      dark: colors.bg[2],
      regular: colors.bg[3],
      light: colors.bg[4],
      veryLight: colors.bg[5],
    },
    border: colors.bg[5],
    button: {
      primary: {
        default: "",
        hover: "",
        disable: "",
        content: "",
        contentHover: "",
      },
      secondary: {
        default: "",
        hover: "",
        disable: "",
        content: "",
        contentHover: "",
      },
      danger: {
        default: "",
        hover: "",
        disable: "",
        content: "",
        contentHover: "",
      },
    },
    content: {
      weak: colors.text.weak,
      main: colors.text.main,
      strong: colors.text.strong,
    },
  },
  dashboard: {
    workspace: {},
    quickStart: {},
    projectList: {},
  },
  editor: {
    secondaryNavbar: {},
    infobox: {},
  },
  settings: {},
  notifications: {
    bg: {
      success: "",
      info: "",
      warning: "",
      error: "",
    },
    content: "",
  },
  modal: {},
  navbar: {
    bg: "",
    avatarBg: "",
    tabButton: {
      selectedBg: "",
      selectedContent: "",
    },
  },
};

export default darkTheme;
