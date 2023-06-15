import type { Colors as CommonColors } from "./common/colors";
import type { MetricsSizesType } from "./common/metrics";
import type { ZIndex } from "./common/zIndex";
import type { Colors as DarkColors } from "./darkTheme/colors";
import type { Colors as LightColors } from "./lightTheme/colors";

type ThemeColors = CommonColors & {
  dark: DarkColors;
  light: LightColors;
};

type InteractiveElementTheme = {
  default: string;
  hover: string;
  disable: string;
  content: string;
  contentHover: string;
};

// Note: anything typed unknown is not set yet and just anticipated with high likelihood
// But, might not be necessary so keep in mind. 2023/06/15 @KaWaite

export type Theme = {
  colors: ThemeColors;
  metrics: MetricsSizesType;
  zIndexes: ZIndex;
  general: {
    brand: string;
    bg: {
      dark: string;
      regular: string;
      light: string;
      veryLight: string;
    };
    border: string;
    button: {
      primary: InteractiveElementTheme;
      secondary: InteractiveElementTheme;
      danger: InteractiveElementTheme;
    };
    content: {
      weak: string;
      main: string;
      strong: string;
    };
  };
  dashboard: {
    workspace: unknown;
    quickStart: unknown;
    projectList: unknown;
  };
  editor: {
    secondaryNavbar: unknown;
    infobox: unknown;
  };
  settings: unknown;
  navbar: {
    bg: string;
    avatarBg: string;
    tabButton: {
      selectedBg: string;
      selectedContent: string;
    };
  };
  modal: unknown;
  notifications: {
    bg: {
      success: string;
      info: string;
      warning: string;
      error: string;
    };
    content: string;
  };
};
