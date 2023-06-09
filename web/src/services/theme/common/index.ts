import colors from "../values/colors";

import { metricsSizes } from "./metrics";
import zIndexes from "./zIndex";

export default {
  zIndexes,
  colors,
  metrics: metricsSizes,
  publishStatus: {
    published: colors.dark.primary.main,
    building: colors.dark.outline.main,
    unpublished: colors.dark.secondary.weakest,
  },
};
