import colors from "./colors";
import { metricsSizes } from "./metrics";
import zIndexes from "./z-index";

export const commonTheme = {
  zIndexes,
  colors,
  metrics: metricsSizes,
  publishStatus: {
    published: colors.primary.main,
    building: colors.outline.main,
    unpublished: colors.secondary.weakest,
  },
};

export type Theme = {
  colors: typeof colors;
  metrics: typeof metricsSizes;
  main: {
    accent: string;
    alert: string;
    bg: string;
    paleBg: string;
    deepBg: string;
    border: string;
    highlighted: string;
    transparentBg: string;
    lightTransparentBg: string;
    text: string;
    strongText: string;
    warning: string;
  };
  dashboard: {
    bg: string;
    itemBg: string;
    itemTitle: string;
    projectName: string;
    projectDescription: string;
    publicationStatus: string;
    memberName: string;
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
  leftMenu: {
    bg: string;
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
    };
  };
  projectCell: {
    bg: string;
    border: string;
    shadow: string;
    text: string;
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
  };
  toggleButton: {
    bg: string;
    bgBorder: string;
    toggle: string;
    activeBg: string;
    activeBgBorder: string;
    activeToggle: string;
  };
  zIndexes: {
    base: number;
    form: number;
    infoBox: number;
    propertyFieldPopup: number;
    descriptionBalloon: number;
    dropDown: number;
    fullScreenModal: number;
    loading: number;
    notificationBar: number;
    splashScreen: number;
  };
  descriptionBalloon: {
    bg: string;
    textColor: string;
    shadowColor: string;
  };
  pluginList: {
    bg: string;
  };
};
