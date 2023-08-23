import { MetricsSizesType, metricsSizes } from "./metrics";
import zIndexes, { ZIndex } from "./zIndex";

export { default as GlobalStyles } from "./globalStyles";

export type Common = {
  zIndexes: ZIndex;
  metrics: MetricsSizesType;
};

const common: Common = {
  zIndexes,
  metrics: metricsSizes,
};

export default common;
