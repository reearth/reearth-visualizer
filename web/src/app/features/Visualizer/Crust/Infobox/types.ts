import type { ComputedFeature, Layer, Spacing } from "@reearth/core";
import type { Item } from "@reearth/services/api/property";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Infobox<BP = any> = {
  featureId?: string;
  property?: InfoboxProperty;
  blocks?: InfoboxBlock<BP>[];
  feature?: ComputedFeature;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type InfoboxBlock<P = any> = {
  id: string;
  name?: string;
  pluginId?: string;
  extensionId?: string;
  extensionType?: "infoboxBlock";
  propertyId?: string;
  property?: P;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  propertyForPluginAPI?: any;
  propertyItemsForPluginBlock?: Item[];
};

export type PluginInfoboxBlock = Omit<
  InfoboxBlock,
  "propertyForPluginAPI" | "propertyItemsForPluginBlock"
>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  choices?: Record<string, string>[];
};
