import { gray, blue, white, coolGray, red, yellow, rgba } from "@carbon/colors";

import commonTheme from "../common";
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
  text: {
    lightest: white,
    main: gray[20],
    weak: gray[60],
    weaker: gray[70],
  },
  select: { light: rgba("#3B3CD0", 0.2), main: "#3B3CD0", strong: "#4770FF" },
  item: { default: "#FFFFFF", hover: gray[90] },
  outline: {
    main: gray[70],
    weak: gray[40],
    weakest: rgba("#000000", 0.25),
  },
  primary: {
    main: blue[60],
    weak: blue[70],
  },
  secondary: {
    main: coolGray[60],
  },
  dangerous: {
    main: red[60],
  },
  warning: { main: yellow[30] },
};

export default darkTheme;
