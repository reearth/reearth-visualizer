import commonTheme from "../common";
import commonColors from "../common/colors";
import type { Theme } from "../types";

import colors from "./colors";

const darkTheme: Theme = {
  ...commonTheme,
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
        main: colors.primary.main,
        hover: colors.primary.main,
        disable: "",
        content: colors.primary.main,
        contentHover: colors.text.strong,
        contentDisable: colors.primary.weakest,
      },
      secondary: {
        main: colors.secondary.main,
        hover: colors.secondary.main,
        disable: "",
        content: colors.secondary.main,
        contentHover: colors.text.strong,
        contentDisable: colors.secondary.weakest,
      },
      danger: {
        main: colors.danger.main,
        hover: colors.danger.main,
        disable: "",
        content: colors.danger.main,
        contentHover: colors.text.strong,
        contentDisable: colors.danger.weakest,
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
    widgetAlignSystem: {
      vertical: {
        bg: commonColors.brand.blue.strongest50,
        border: commonColors.brand.blue.strongest,
      },
      horizontal: {
        bg: commonColors.brand.orange.main50,
        border: commonColors.brand.orange.main,
      },
    },
    slider: {
      bg: colors.bg[3],
      border: colors.outline.weak,
      main: colors.primary.main,
    },
    colorField: {
      border: colors.outline.weak,
      focusBorder: colors.outline.main,
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
      main: colors.bg[2],
      hover: "",
    },
    avatarBg: "",
    tabButton: {
      selectedBg: "",
      selectedContent: "",
    },
  },
};

export default darkTheme;
