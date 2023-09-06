import { MetricsSizesType, metricsSizes } from "./metrics";
import spacingSizes, { SpacingSizesType } from "./spacing";
import zIndexes, { ZIndex } from "./zIndex";

export { default as GlobalStyles } from "./globalStyles";

export type Common = {
  zIndexes: ZIndex;
  metrics: MetricsSizesType;
  spacing: SpacingSizesType;
};

const common: Common = {
  zIndexes,
  metrics: metricsSizes,
  spacing: spacingSizes,
};

export default common;
