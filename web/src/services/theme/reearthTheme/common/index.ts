import colors, { Colors } from "./colors";
import { MetricsSizesType, metricsSizes } from "./metrics";
import zIndexes, { ZIndex } from "./zIndex";

export { default as GlobalStyles } from "./globalStyles";

export type Common = {
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
