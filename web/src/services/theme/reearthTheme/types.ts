import { Theme as ClassicTheme } from "@reearth/classic/theme/reearthTheme/types";
import { Common } from "@reearth/services/theme/reearthTheme/common";

export type TempTheme = Theme & {
  classic: ClassicTheme;
};

export type Theme = Common & {
  bg: {
    transparentBlack: string;
    0: string;
    1: string;
    2: string;
    3: string;
    4: string;
  };
  select: {
    weaker: string;
    main: string;
    strong: string;
  };
  item: {
    default: string;
    hover: string;
  };
  outline: {
    weakest: string;
    weaker: string;
    weak: string;
    main: string;
  };
  primary: {
    main: string;
    weak: string;
    strong: string;
  };
  content: {
    withBackground: string;
    strong: string;
    main: string;
    weak: string;
    weaker: string;
  };
  secondary: {
    weak: string;
    main: string;
    strong: string;
  };
  dangerous: {
    main: string;
  };
  warning: {
    main: string;
  };
  placeHolder: {
    main_1: string;
    main_2: string;
  };
};
