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
  main: {
    accent: colors.primary.main,
    alert: colors.functional.error,
    bg: colors.bg[5],
    lighterBg: colors.bg[3],
    paleBg: colors.bg[4],
    deepBg: colors.bg[2],
    deepestBg: colors.bg[1],
    transparentBg: commonColors.general.transparentBlack,
    lightTransparentBg: commonColors.general.transparentLight,
    border: colors.outline.weak,
    borderStrong: colors.outline.strong,
    highlighted: colors.functional.select,
    text: colors.text.main,
    strongText: colors.text.strong,
    warning: colors.functional.attention,
    danger: colors.danger.main,
    weak: colors.text.weak,
    select: colors.functional.select,
    link: colors.functional.link,
    brandBlue: commonColors.brand.bg[1],
    brandRed: commonColors.brand.bg[2],
    avatarBg: colors.bg[5],
  },
  dashboard: {
    bg: colors.bg[2],
    itemBg: colors.bg[3],
    projectName: colors.text.strong,
    projectDescription: colors.text.strong,
    publicationStatus: colors.text.main,
    heroButtonText: colors.text.main,
    heroButtonTextHover: colors.text.strong,
  },
  buttonPrimary: {
    bgHover: colors.primary.main,
    color: colors.primary.main,
    colorHover: colors.text.strong,
    disabled: colors.primary.weakest,
  },
  buttonSecondary: {
    bgHover: colors.secondary.main,
    color: colors.secondary.main,
    colorHover: colors.other.white,
    disabled: colors.secondary.weakest,
  },
  buttonDanger: {
    bgHover: colors.danger.main,
    color: colors.danger.main,
    colorHover: colors.other.white,
    disabled: colors.danger.weakest,
  },
  infoBox: {
    accent: colors.primary.main,
    accent2: colors.functional.select,
    alert: colors.functional.error,
    bg: colors.bg[3],
    deepBg: colors.bg[2],
    headerBg: colors.bg[5],
    mainText: colors.text.main,
    weakText: colors.text.weak,
    border: colors.outline.main,
  },
  publishStatus: {
    building: colors.functional.error,
    published: colors.functional.success,
    unpublished: colors.outline.main,
  },
  editorNavBar: {
    bg: colors.bg[2],
  },
  leftMenu: {
    bg: colors.bg[2],
    bgTitle: colors.bg[5],
    hoverBg: colors.bg[1],
    highlighted: colors.functional.select,
    icon: colors.functional.select,
    text: colors.text.main,
    enabledBg: colors.text.main,
    disabledBg: colors.bg[5],
  },
  projectCell: {
    border: colors.functional.select,
    bg: colors.bg[2],
    shadow: colors.bg[1],
    text: colors.text.strong,
    divider: colors.outline.weakest,
    title: colors.text.strong,
    description: colors.text.main,
  },
  assetCard: {
    bg: colors.bg[4],
    bgHover: colors.bg[5],
    highlight: colors.functional.select,
    text: colors.text.main,
    textHover: colors.text.strong,
    shadow: colors.bg[1],
  },
  assetsContainer: {
    bg: colors.bg[4],
  },
  modal: {
    overlayBg: colors.bg[1],
    bodyBg: colors.bg[2],
    innerBg: colors.bg[3],
  },
  tabArea: {
    bg: colors.bg[1],
    selectedBg: colors.bg[2],
    text: colors.text.strong,
  },
  header: {
    bg: colors.bg[4],
    text: colors.text.main,
  },
  primitiveHeader: {
    bg: colors.bg[1],
  },
  statusText: {
    color: colors.text.strong,
  },
  text: {
    default: colors.text.main,
    pale: colors.outline.main,
  },
  selectList: {
    border: colors.outline.main,
    bg: colors.bg[5],
    container: {
      bg: colors.bg[5],
    },
    control: {
      bg: colors.bg[5],
    },
    input: {
      color: colors.text.main,
    },
    menu: {
      bg: colors.bg[5],
    },
    option: {
      bottomBorder: colors.text.main,
      hoverBg: colors.bg[5],
      bg: colors.bg[4],
      color: colors.text.main,
    },
  },
  slider: {
    background: colors.bg[2],
    border: colors.primary.main,
    handle: colors.primary.main,
    track: colors.primary.main,
  },
  properties: {
    accent: colors.primary.main,
    bg: colors.bg[3],
    deepBg: colors.bg[2],
    border: colors.outline.weak,
    focusBorder: colors.outline.main,
    contentsFloatText: colors.text.main,
    contentsText: colors.text.main,
    titleText: colors.text.strong,
    text: colors.text.weak,
  },
  layers: {
    bg: colors.bg[4],
    paleBg: colors.bg[5],
    deepBg: colors.bg[2],
    hoverBg: colors.bg[4],
    smallText: colors.text.main,
    selectedLayer: colors.functional.select,
    textColor: colors.text.main,
    selectedTextColor: colors.text.strong,
    disableTextColor: colors.text.weak,
    highlight: colors.outline.main,
    bottomBorder: colors.outline.weakest,
  },
  toggleButton: {
    bg: colors.bg[4],
    bgBorder: colors.outline.main,
    toggle: colors.outline.main,
    activeBg: colors.bg[4],
    activeBgBorder: colors.outline.main,
    activeToggle: colors.outline.main,
    highlight: colors.outline.strong,
  },
  descriptionBalloon: {
    bg: colors.bg[5],
    textColor: colors.text.main,
    shadowColor: colors.bg[1],
  },
  other: {
    black: colors.other.black,
    white: colors.other.white,
  },
  pluginList: {
    bg: colors.bg[3],
  },
  notification: {
    errorBg: colors.functional.error,
    warningBg: colors.functional.attention,
    infoBg: colors.functional.notice,
    successBg: colors.functional.success,
    text: colors.text.strong,
  },
  alignSystem: {
    blueBg: commonColors.brand.blue.strongest50,
    blueHighlight: commonColors.brand.blue.strongest,
    orangeBg: commonColors.brand.orange.main50,
    orangeHighlight: commonColors.brand.orange.main,
  },
};

export default darkTheme;
