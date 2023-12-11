const spacingSizes = {
  micro: 2,
  smallest: 4,
  small: 8,
  normal: 12,
  large: 16,
  largest: 20,
  super: 24,
} as const;

export type SpacingSizesType = typeof spacingSizes;

export type SpacingSizes = keyof typeof spacingSizes;

export default spacingSizes;
