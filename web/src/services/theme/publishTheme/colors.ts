import dark from "./darkTheme/colors";
import forest from "./forestTheme/colors";
import light from "./lightTheme/colors";
import type { PublishColors } from "./types";

const publishColors: Omit<PublishColors, "custom"> = {
  dark,
  light,
  forest,
};

export default publishColors;
