import type { Layer, Spacing } from "@reearth/beta/lib/core/mantle";

export type Infobox<BP = any> = {
  property?: InfoboxProperty;
  blocks?: InfoboxBlock<BP>[];
};

export type InfoboxProperty = {
  default?: {
    enabled?: boolean;
    position?: "right" | "left";
    padding?: Spacing;
    gap?: number;
  };
  // for compat
  defaultContent?: "description" | "attributes";
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
