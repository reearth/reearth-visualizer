import { merge } from "lodash-es";

import { Component } from "..";
import {
  IMAGE_BUILTIN_INFOBOX_BLOCK_ID,
  TEXT_BUILTIN_INFOBOX_BLOCK_ID,
  PROPERTY_BUILTIN_INFOBOX_BLOCK_ID,
} from "../../constants";

import ImageBlock from "./Image";
import PropertyListBlock from "./PropertyList";
import TextBlock from "./Text";

export type ReEarthBuiltinInfoboxBlocks<T = unknown> = Record<
  | typeof TEXT_BUILTIN_INFOBOX_BLOCK_ID
  | typeof PROPERTY_BUILTIN_INFOBOX_BLOCK_ID
  | typeof IMAGE_BUILTIN_INFOBOX_BLOCK_ID,
  T
>;

// export type BuiltinBlocks<T = unknown> = ReEarthBuiltinStoryBlocks<T> & UnsafeBuiltinBlocks<T>;
export type BuiltinInfoboxBlocks<T = unknown> = ReEarthBuiltinInfoboxBlocks<T>;

const reearthBuiltin: BuiltinInfoboxBlocks<Component> = {
  [IMAGE_BUILTIN_INFOBOX_BLOCK_ID]: ImageBlock,
  [TEXT_BUILTIN_INFOBOX_BLOCK_ID]: TextBlock,
  [PROPERTY_BUILTIN_INFOBOX_BLOCK_ID]: PropertyListBlock,
};

const builtin = merge({}, reearthBuiltin);

export const isBuiltinInfoboxBlock = (id: string): id is keyof BuiltinInfoboxBlocks => {
  return !!builtin[id as keyof BuiltinInfoboxBlocks];
};

export default builtin;
