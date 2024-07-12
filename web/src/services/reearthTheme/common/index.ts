import { MetricsSizesType, metricsSizes } from "@reearth/beta/utils/metrics";

import colors, { Colors } from "./colors";
import zIndexes, { ZIndex } from "./zIndex";

type Common = {
  zIndexes: ZIndex;
  colors: Colors;
  metrics: MetricsSizesType;
};

const common: Common = {
  zIndexes,
  colors,
  metrics: metricsSizes,
};

export default common;
