import type { PublishTheme } from "../types";

import publishColors from "./colors";

export const light: PublishTheme = {
  strongText: publishColors.light.text.strong,
  mainText: publishColors.light.text.main,
  weakText: publishColors.light.text.weak,
  strongIcon: publishColors.light.icon.strong,
  mainIcon: publishColors.light.icon.main,
  weakIcon: publishColors.light.icon.weak,
  select: publishColors.light.other.select,
  mask: publishColors.light.other.mask,
  background: publishColors.light.other.background,
};
