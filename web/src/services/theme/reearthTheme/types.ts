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
    light: string;
    main: string;
    strong: string;
  };
  item: {
    default: string;
    hover: string;
  };
  outline: {
    weakest: string;
    weak: string;
    main: string;
  };
  primary: {
    main: string;
    weak: string;
  };
  text: {
    lightest: string;
    main: string;
    weak: string;
    weaker: string;
  };
  secondary: {
    main: string;
  };
  dangerous: {
    main: string;
  };
  warning: {
    main: string;
  };
};
