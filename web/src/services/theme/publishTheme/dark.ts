import type { PublishTheme } from "../types";

import publishColors from "./colors";

export const dark: PublishTheme = {
  strongText: publishColors.dark.text.strong,
  mainText: publishColors.dark.text.main,
  weakText: publishColors.dark.text.weak,
  strongIcon: publishColors.dark.icon.strong,
  mainIcon: publishColors.dark.icon.main,
  weakIcon: publishColors.dark.icon.weak,
  select: publishColors.dark.other.select,
  mask: publishColors.dark.other.mask,
  background: publishColors.dark.other.background,
};
