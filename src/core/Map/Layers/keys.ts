import { appearanceKeyObj } from "../../mantle";
import type { LegacyLayer, ComputedLayer, Layer } from "../../mantle";

import type { LazyLayer } from "./hooks";

export const layerKeys = objKeys<
  Exclude<KeysOfUnion<Layer | LegacyLayer | LazyLayer>, "id" | "compat">
>({
  // layer
  children: 1,
  data: 1,
  infobox: 1,
  properties: 1,
  tags: 1,
  title: 1,
  type: 1,
  creator: 1,
  computed: 1,
  defines: 1,
  // appearance
  ...appearanceKeyObj,
  // legacy layer
  property: 1,
  propertyId: 1,
  pluginId: 1,
  extensionId: 1,
  isVisible: 1,
  visible: 1,
  events: 1,
});

export const computedLayerKeys = objKeys<Exclude<KeysOfUnion<ComputedLayer>, "id">>({
  features: 1,
  layer: 1,
  originalFeatures: 1,
  properties: 1,
  status: 1,
  ...appearanceKeyObj,
});

export type KeysOfUnion<T> = T extends T ? keyof T : never;

/**
 * Often we want to make an array of keys of an object type,
 * but if we just specify the key names directly, we may forget to change the array if the object type is changed.
 * With this function, the compiler checks the object keys for completeness, so the array of keys is always up to date.
 */
export function objKeys<T extends string | number | symbol>(obj: { [k in T]: 1 }): T[] {
  return Object.keys(obj) as T[];
}
