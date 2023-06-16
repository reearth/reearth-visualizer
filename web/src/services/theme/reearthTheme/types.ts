import { Theme as ClassicTheme } from "@reearth/classic/theme/reearthTheme/types";

import type { Colors as CommonColors } from "./common/colors";
import type { MetricsSizesType } from "./common/metrics";
import type { ZIndex } from "./common/zIndex";
import type { Colors as DarkColors } from "./darkTheme/colors";
import type { Colors as LightColors } from "./lightTheme/colors";

export type TempTheme = Theme & {
  classic: ClassicTheme;
};

type ThemeColors = CommonColors & {
  dark: DarkColors;
  light: LightColors;
};

type InteractiveElementTheme = {
  main: string;
  hover: string;
  disable: string;
  content: string;
  contentHover?: string;
  contentDisable?: string;
};

// Note: anything typed unknown is not set yet and just anticipated with high likelihood
// But, might not be necessary so keep in mind. 2023/06/15 @KaWaite

export type Theme = {
  colors: ThemeColors;
  metrics: MetricsSizesType;
  zIndexes: ZIndex;
  general: {
    select: string;
    bg: {
      transparent: string;
      veryWeak: string;
      weak: string;
      main: string;
      strong: string;
      veryStrong: string;
    }; // Do we need????
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
    widgetAlignSystem: {
      vertical: {
        bg: string;
        border: string;
      };
      horizontal: {
        bg: string;
        border: string;
      };
    };
    slider: {
      bg: string;
      main: string;
      border: string;
    };
  };
  settings: unknown;
  navbar: {
    bg: {
      main: string;
      hover: string;
    };
    avatarBg: string;
    tabButton: {
      selectedBg: string;
      selectedContent: string;
    };
  };
  modal?: unknown;
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
