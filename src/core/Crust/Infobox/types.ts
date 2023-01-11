import type { Typography } from "../types";

export type { LatLng, Typography, ValueTypes, ValueType, Theme } from "../types";

export type InfoboxProperty = {
  showTitle?: boolean;
  title?: string;
  height?: number;
  heightType?: "auto" | "manual";
  infoboxPaddingTop?: number;
  infoboxPaddingBottom?: number;
  infoboxPaddingLeft?: number;
  infoboxPaddingRight?: number;
  size?: "small" | "medium" | "large";
  position?: "right" | "middle" | "left";
  typography?: Typography;
  bgcolor?: string;
  outlineColor?: string;
  outlineWidth?: number;
  useMask?: boolean;
};

export type Block<P = any> = {
  id: string;
  pluginId?: string;
  extensionId?: string;
  property?: P;
  propertyId?: string;
};
