import colors, { Colors } from "./colors";
import { MetricsSizesType, metricsSizes } from "./metrics";
import zIndexes, { ZIndex } from "./zIndex";

export type { MetricsSizes } from "./metrics";

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
