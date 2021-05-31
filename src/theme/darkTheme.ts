import colors from "./colors";
import { Theme, commonTheme } from "./theme";

const darkTheme: Theme = {
  ...commonTheme,
  main: {
    accent: colors.primary.main,
    alert: colors.functional.error,
    bg: colors.bg[5],
    paleBg: colors.bg[4],
    deepBg: colors.bg[2],
    transparentBg: colors.transparentBlack,
    lightTransparentBg: colors.transparentLight,
    border: colors.outline.weak,
    highlighted: colors.brand.main,
    text: colors.text.main,
    strongText: colors.text.strong,
    warning: colors.functional.attention,
  },
  dashboard: {
    bg: colors.bg[2],
    itemBg: colors.bg[3],
    itemTitle: colors.text.main,
    projectName: colors.text.strong,
    projectDescription: colors.text.strong,
    publicationStatus: colors.text.main,
    memberName: colors.text.main,
  },
  buttonPrimary: {
    bgHover: colors.primary.strong,
    color: colors.primary.main,
    colorHover: colors.text.strong,
    disabled: colors.primary.weakest,
  },
  buttonSecondary: {
    bgHover: colors.secondary.main,
    color: colors.secondary.main,
    colorHover: colors.other.black,
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
    accent2: colors.brand.main,
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
    published: colors.brand.main,
    unpublished: colors.outline.main,
  },
  leftMenu: {
    bg: colors.bg[2],
    hoverBg: colors.bg[1],
    highlighted: colors.brand.main,
    icon: colors.brand.main,
    text: colors.text.main,
    enabledBg: colors.text.main,
    disabledBg: colors.bg[5],
  },
  projectCell: {
    border: colors.brand.main,
    bg: colors.bg[2],
    shadow: colors.bg[1],
    text: colors.text.strong,
  },
  assetCard: {
    bg: colors.bg[4],
    bgHover: colors.bg[5],
    highlight: colors.brand.main,
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
      bg: colors.bg[5],
      color: colors.text.main,
    },
  },
  slider: {
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
    selectedLayer: colors.brand.main,
    textColor: colors.text.main,
    selectedTextColor: colors.text.strong,
    disableTextColor: colors.text.weak,
  },
  toggleButton: {
    bg: colors.bg[4],
    bgBorder: colors.outline.main,
    toggle: colors.outline.main,
    activeBg: colors.bg[4],
    activeBgBorder: colors.brand.main,
    activeToggle: colors.brand.main,
  },
  descriptionBalloon: {
    bg: colors.bg[5],
    textColor: colors.text.main,
    shadowColor: colors.bg[1],
  },
  pluginList: {
    bg: colors.bg[3],
  },
};

export default darkTheme;
