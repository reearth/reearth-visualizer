import colors from "./values/colors";
import { metricsSizes } from "./values/metrics";
import zIndexes from "./values/z-index";

export const commonTheme = {
  zIndexes,
  colors,
  metrics: metricsSizes,
  publishStatus: {
    published: colors.dark.primary.main,
    building: colors.dark.outline.main,
    unpublished: colors.dark.secondary.weakest,
  },
};
