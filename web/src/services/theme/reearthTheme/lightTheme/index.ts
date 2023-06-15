import commonTheme from "../common";
import commonColors from "../common/colors";
import darkColors from "../darkTheme/colors";
import type { Theme } from "../types";

import colors from "./colors";

// Note: This file mirrors darkTheme as of 2023/06/15
// At this time, there is no Beta light theme, so any values here
// are not guaranteed to look right in the UI. @KaWaite

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

export default lightTheme;
