import colors from "./colors";
import { metricsSizes } from "./metrics";
import zIndexes from "./zIndex";

export default {
  zIndexes,
  colors,
  metrics: metricsSizes,
  publishStatus: {
    published: colors.publish.published,
    building: colors.publish.building,
    unpublished: colors.publish.unpublished,
  },
};
