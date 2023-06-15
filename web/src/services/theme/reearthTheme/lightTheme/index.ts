import commonTheme from "../common";
import commonColors from "../common/colors";
import darkColors from "../darkTheme/colors";
import type { Theme } from "../types";

import colors from "./colors";

const lightTheme: Theme = {
  ...commonTheme,
  colors: {
    ...commonColors,
    dark: { ...darkColors },
    light: { ...colors },
  },
  general: {
    select: colors.functional.select,
    bg: {
      transparent: commonColors.general.transparentBlack,
      veryWeak: colors.bg[5],
      weak: colors.bg[4],
      main: colors.bg[3],
      strong: colors.bg[2],
      veryStrong: colors.bg[1],
    },
    border: colors.bg[5],
    button: {
      primary: {
        main: "",
        hover: "",
        disable: "",
        content: "",
        contentHover: "",
        contentDisable: "",
      },
      secondary: {
        main: "",
        hover: "",
        disable: "",
        content: "",
        contentHover: "",
        contentDisable: "",
      },
      danger: {
        main: "",
        hover: "",
        disable: "",
        content: "",
        contentHover: "",
        contentDisable: "",
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
    slider: {
      bg: colors.bg[3],
      border: colors.outline.weak,
      main: colors.primary.main,
    },
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
  navbar: {
    bg: {
      main: "",
      hover: "",
    },
    avatarBg: "",
    tabButton: {
      selectedBg: "",
      selectedContent: "",
    },
  },
};

export default lightTheme;
