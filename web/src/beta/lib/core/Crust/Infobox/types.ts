import type { Layer, Spacing } from "@reearth/beta/lib/core/mantle";

export type Infobox<BP = any> = {
  featureId?: string;
  property?: InfoboxProperty;
  blocks?: InfoboxBlock<BP>[];
};

export type InfoboxProperty = {
  default?: {
    enabled?: PropertyItem<boolean>;
    position?: PropertyItem<"right" | "left">;
    padding?: PropertyItem<Spacing>;
    gap?: PropertyItem<number>;
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

export type PropertyItem<T> = {
  type?: string;
  ui?: string;
  title?: string;
  description?: string;
  value?: T;
  min?: number;
  max?: number;
  choices?: { [key: string]: string }[];
};
