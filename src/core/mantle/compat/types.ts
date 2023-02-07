export type LegacyLayer<P = any, IBP = any> = {
  id: string;
  type?: string;
  pluginId?: string;
  extensionId?: string;
  title?: string;
  property?: P;
  infobox?: Infobox<IBP>;
  isVisible?: boolean;
  propertyId?: string;
  tags?: Tag[];
  readonly children?: LegacyLayer[];
  creator?: string;
};

export type Tag = {
  id: string;
  label: string;
  tags?: Tag[];
};

export type Infobox<BP = any> = {
  property?: InfoboxProperty;
  blocks?: Block<BP>[];
};

export type InfoboxProperty = {
  default?: {
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
};

export type Block<P = any> = {
  id: string;
  pluginId?: string;
  extensionId?: string;
  property?: P;
  propertyId?: string;
};

export type Rect = {
  north: number;
  south: number;
  east: number;
  west: number;
};

/** Represents the camera position and state */
export type CameraPosition = {
  /** degrees */
  lat: number;
  /** degrees */
  lng: number;
  /** meters */
  height: number;
  /** radians */
  heading: number;
  /** radians */
  pitch: number;
  /** radians */
  roll: number;
  /** Field of view expressed in radians */
  fov: number;
};

export type Typography = {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  textAlign?: "left" | "center" | "right" | "justify" | "justify_all";
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
};

export type LegacyCluster = {
  id: string;
  default?: {
    clusterPixelRange: number;
    clusterMinSize: number;
    clusterLabelTypography?: Typography;
    clusterImage?: string;
    clusterImageHeight?: number;
    clusterImageWidth?: number;
  };
  layers?: { layer?: string }[];
};
