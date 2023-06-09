const metrics = {
  headerHeight: 49,
  primitiveHeaderHeight: 44,
  MenuIconBarWidth: 40,
  layerIconAndArrowWidth: 46,
  layerSidePadding: 10,
  propertyMenuMinWidthClassic: 264, // REMOVE WITH CLASSIC
  propertyMenuMaxWidthClassic: 346, // REMOVE WITH CLASSIC
  propertyMenuMinWidth: 272,
  propertyMenuMaxWidth: 336,
  propertyTextInputHeight: 30,
  propertyTextareaHeight: 190,
  dashboardWorkspaceMinWidth: 364,
  dashboardQuickMinWidth: 270,
  dashboardContentHeight: 250,
  dashboardContentSmallHeight: 156,
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
