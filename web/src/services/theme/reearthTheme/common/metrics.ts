const metrics = {
  propertyMenuWidth: 308,
  propertyMenuMinWidth: 200,
  bottomPanelMinHeight: 136,
  bottomPanelMaxHeight: 232,
};

export const metricsSizes = {
  "2xs": 2,
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 28,
  "4xl": 32,
} as const;

export type MetricsSizesType = typeof metricsSizes;

export type MetricsSizes = keyof typeof metricsSizes;

export default metrics;
