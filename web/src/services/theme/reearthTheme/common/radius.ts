const radiusSizes = {
  null: 0,
  smallest: 2,
  small: 4,
  normal: 6,
  large: 8
} as const;

export type RadiusSizesType = typeof radiusSizes;

export default radiusSizes;
