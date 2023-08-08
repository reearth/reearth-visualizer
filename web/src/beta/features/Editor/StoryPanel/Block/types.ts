import type { Layer } from "@reearth/beta/lib/core/mantle";

export type Block<P = unknown> = {
  id: string;
  pluginId?: string;
  extensionId?: string;
  property?: P;
  propertyId?: string;
};

export type BlockProps<P = unknown> = {
  block?: Block<P>;
  layer?: Layer;
  onClick?: () => void;
};
