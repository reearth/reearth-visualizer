import type { Layer } from "@reearth/core/mantle";

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
  defaultContent?: "description" | "attributes";
};

export type Block<P = any> = {
  id: string;
  pluginId?: string;
  extensionId?: string;
  property?: P;
  propertyId?: string;
};

export type BlockProps<P = any> = {
  block?: Block<P>;
  layer?: Layer;
  onClick?: () => void;
};
