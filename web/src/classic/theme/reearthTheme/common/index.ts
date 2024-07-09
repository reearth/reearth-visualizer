import colors, { Colors } from "./colors";
import { MetricsSizesType, metricsSizes } from "../../../../beta/utils/metrics";
import zIndexes, { ZIndex } from "./zIndex";

export type { MetricsSizes } from "../../../../beta/utils/metrics";

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
