import { gray, blue, white, coolGray, red, yellow, rgba } from "@carbon/colors";

import commonTheme from "../common";
import { brandBlue, brandRed } from "../common/colors";
import type { Theme } from "../types";

const darkTheme: Theme = {
  ...commonTheme,
  bg: {
    transparentBlack: rgba("#000000", 0.7),
    base: "#060606",
    0: gray[100],
    1: gray[90],
    2: gray[80],
    3: gray[70],
    4: gray[60],
  },
  content: {
    withBackground: white,
    weaker: gray[70],
    weak: gray[60],
    main: gray[20],
    strong: gray[10],
  },
  select: {
    weaker: rgba(brandBlue.main, 0.2),
    weak: rgba(brandBlue.main, 0.5),
    main: brandBlue.main,
    strong: brandBlue.light,
  },
  item: { default: "#FFFFFF", hover: gray[90] },
  outline: {
    weakest: rgba("#000000", 0.25),
    weaker: coolGray[80],
    weak: coolGray[70],
    main: gray[40],
  },
  primary: {
    weakest: blue[80],
    weak: blue[70],
    main: blue[60],
    strong: blue[50],
  },
  secondary: {
    weak: coolGray[80],
    main: coolGray[70],
    strong: coolGray[60],
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
    dim: rgba("#ffffff", 0.05),
    dark: rgba("#000000", 0.1),
    darker: rgba("#000000", 0.15),
    darkest: rgba("#000000", 0.2),
  },
  placeHolder: { main_1: rgba("#FF560E", 0.2), main_2: rgba(brandBlue.main, 0.2) },
  colorSchema: "dark",
};

export default darkTheme;
