import { gray, blue, white, coolGray, red, yellow, rgba } from "@carbon/colors";

import commonTheme from "../common";
import { brandBlue } from "../common/colors";
import type { Theme } from "../types";

const darkTheme: Theme = {
  ...commonTheme,
  bg: {
    transparentBlack: rgba("#000000", 0.7),
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
  select: { weaker: rgba(brandBlue.main, 0.2), main: brandBlue.main, strong: brandBlue.light },
  item: { default: "#FFFFFF", hover: gray[90] },
  outline: {
    weakest: rgba("#000000", 0.25),
    weaker: gray[80],
    weak: gray[70],
    main: gray[40],
  },
  primary: {
    weak: blue[70],
    main: blue[60],
    strong: blue[50],
  },
  secondary: {
    weak: coolGray[80],
    main: coolGray[60],
    strong: coolGray[20],
  },
  dangerous: {
    main: red[60],
  },
  warning: { main: yellow[30] },
  placeHolder: { main_1: rgba("#FF560E", 0.2), main_2: rgba(brandBlue.main, 0.2) },
};

export default darkTheme;
