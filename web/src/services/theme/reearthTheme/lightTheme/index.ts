import { gray, blue, white, coolGray, red, yellow, rgba } from "@carbon/colors";

import commonTheme from "../common";
import { brandBlue, brandRed } from "../common/colors";
import type { Theme } from "../types";

const lightTheme: Theme = {
  ...commonTheme,
  bg: {
    transparentBlack: rgba("#000000", 0.7),
    base: white,
    0: white,
    1: gray[10],
    2: gray[30],
    3: gray[50],
    4: gray[60],
  },
  content: {
    withBackground: white,
    weaker: gray[30],
    weak: gray[60],
    main: gray[90],
    strong: gray[100],
  },
  select: {
    weaker: rgba(brandBlue.main, 0.2),
    weak: white,
    main: brandBlue.main,
    strong: brandBlue.light,
  },
  item: { default: "#FFFFFF", hover: gray[90] },
  outline: {
    weakest: rgba("#000000", 0.25),
    weaker: coolGray[30],
    weak: gray[50],
    main: gray[50],
  },
  primary: {
    weakest: white,
    weak: blue[70],
    main: blue[60],
    strong: white,
  },
  secondary: {
    weak: coolGray[20],
    main: coolGray[40],
    strong: coolGray[50],
  },
  dangerous: {
    main: red[60],
    weak: red[70],
    strong: brandRed.dark,
  },
  warning: { main: yellow[30] },
  relative: {
    lightest: rgba("#ffffff", 0.2),
    lighter: rgba("#ffffff", 0.15),
    light: rgba("#ffffff", 0.1),
    dark: rgba("#000000", 0.1),
    darker: rgba("#000000", 0.15),
    darkest: rgba("#000000", 0.2),
  },
  placeHolder: { main_1: rgba("#FF560E", 0.2), main_2: rgba(brandBlue.main, 0.2) },
  colorSchema: "light",
};
export default lightTheme;
