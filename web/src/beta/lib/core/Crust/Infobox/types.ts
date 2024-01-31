import type { Layer } from "@reearth/beta/lib/core/mantle";

import { Typography } from "../types";

export type Infobox<BP = any> = {
  property?: InfoboxProperty;
  blocks?: InfoboxBlock<BP>[];
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
    defaultContent?: "description" | "attributes";
    unselectOnClose?: boolean;
  };
};

export type InfoboxBlock<P = any> = {
  id: string;
  name?: string;
  pluginId?: string;
  extensionId?: string;
  property?: P;
  propertyId?: string;
};

export type InfoboxBlockProps<P = any> = {
  block?: InfoboxBlock<P>;
  layer?: Layer;
  onClick?: () => void;
};
