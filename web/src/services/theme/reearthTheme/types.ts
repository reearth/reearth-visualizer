import type { Colors as CommonColors } from "./common/colors";
import type { MetricsSizesType } from "./common/metrics";
import type { ZIndex } from "./common/zIndex";
import type { Colors as DarkColors } from "./darkTheme/colors";
import type { Colors as LightColors } from "./lightTheme/colors";

type ThemeColors = CommonColors & {
  dark: DarkColors;
  light: LightColors;
};

export type Theme = {
  colors: ThemeColors;
  metrics: MetricsSizesType;
  zIndexes: ZIndex;
  main: {
    accent: string;
    alert: string;
    bg: string;
    lighterBg: string;
    paleBg: string;
    deepBg: string;
    deepestBg: string;
    border: string;
    borderStrong: string;
    highlighted: string;
    transparentBg: string;
    lightTransparentBg: string;
    text: string;
    strongText: string;
    warning: string;
    danger: string;
    weak: string;
    select: string;
    link: string;
    brandBlue: string;
    brandRed: string;
    avatarBg: string;
  };
  dashboard: {
    bg: string;
    itemBg: string;
    projectName: string;
    projectDescription: string;
    publicationStatus: string;
    heroButtonText: string;
    heroButtonTextHover: string;
  };
  buttonPrimary: {
    bgHover: string;
    color: string;
    colorHover: string;
    disabled: string;
  };
  buttonSecondary: {
    bgHover: string;
    color: string;
    colorHover: string;
    disabled: string;
  };
  buttonDanger: {
    bgHover: string;
    color: string;
    colorHover: string;
    disabled: string;
  };
  publishStatus: {
    building: string;
    published: string;
    unpublished: string;
  };
  editorNavBar: {
    bg: string;
  };
  leftMenu: {
    bg: string;
    bgTitle: string;
    highlighted: string;
    hoverBg: string;
    icon: string;
    text: string;
    enabledBg: string;
    disabledBg: string;
  };
  header: {
    bg: string;
    text: string;
  };
  primitiveHeader: {
    bg: string;
  };
  infoBox: {
    accent: string;
    accent2: string;
    alert: string;
    bg: string;
    deepBg: string;
    headerBg: string;
    mainText: string;
    weakText: string;
    border: string;
  };
  statusText: {
    color: string;
  };
  text: {
    default: string;
    pale: string;
  };
  selectList: {
    border: string;
    bg: string;
    container: {
      bg: string;
    };
    control: {
      bg: string;
    };
    input: {
      color: string;
    };
    menu: {
      bg: string;
    };
    option: {
      bottomBorder: string;
      bg: string;
      color: string;
      hoverBg: string;
    };
  };
  projectCell: {
    bg: string;
    border: string;
    shadow: string;
    text: string;
    divider: string;
    title: string;
    description: string;
  };
  assetCard: {
    bg: string;
    bgHover: string;
    highlight: string;
    text: string;
    textHover: string;
    shadow: string;
  };
  assetsContainer: {
    bg: string;
  };
  modal: {
    overlayBg: string;
    bodyBg: string;
    innerBg: string;
  };
  tabArea: {
    bg: string;
    selectedBg: string;
    text: string;
  };
  slider: {
    background: string;
    border: string;
    handle: string;
    track: string;
  };
  properties: {
    accent: string;
    bg: string;
    border: string;
    focusBorder: string;
    contentsText: string;
    contentsFloatText: string;
    deepBg: string;
    titleText: string;
    text: string;
  };
  layers: {
    bg: string;
    deepBg: string;
    paleBg: string;
    hoverBg: string;
    smallText: string;
    selectedLayer: string;
    textColor: string;
    selectedTextColor: string;
    disableTextColor: string;
    highlight: string;
    bottomBorder: string;
  };
  toggleButton: {
    bg: string;
    bgBorder: string;
    toggle: string;
    activeBg: string;
    activeBgBorder: string;
    activeToggle: string;
    highlight: string;
  };
  descriptionBalloon: {
    bg: string;
    textColor: string;
    shadowColor: string;
  };
  other: {
    black: string;
    white: string;
  };
  pluginList: {
    bg: string;
  };
  notification: {
    errorBg: string;
    warningBg: string;
    infoBg: string;
    successBg: string;
    text: string;
  };
  alignSystem: {
    blueBg: string;
    orangeBg: string;
    blueHighlight: string;
    orangeHighlight: string;
  };
};
