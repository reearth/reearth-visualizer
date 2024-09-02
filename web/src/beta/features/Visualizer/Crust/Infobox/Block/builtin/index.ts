import { merge } from "lodash-es";

import { Component } from "..";
import {
  IMAGE_BUILTIN_INFOBOX_BLOCK_ID,
  TEXT_BUILTIN_INFOBOX_BLOCK_ID,
  PROPERTY_BUILTIN_INFOBOX_BLOCK_ID,
  VIDEO_BUILTIN_INFOBOX_BLOCK_ID,
  MARKDOWN_BUILTIN_INFOBOX_BLOCK_ID
} from "../../constants";

import ImageBlock from "./Image";
import MarkdownBlock from "./Markdown";
import PropertyListBlock from "./PropertyList";
import TextBlock from "./Text";
import VideoBlock from "./Video";

export type ReEarthBuiltinInfoboxBlocks<T = unknown> = Record<
  | typeof TEXT_BUILTIN_INFOBOX_BLOCK_ID
  | typeof PROPERTY_BUILTIN_INFOBOX_BLOCK_ID
  | typeof IMAGE_BUILTIN_INFOBOX_BLOCK_ID
  | typeof VIDEO_BUILTIN_INFOBOX_BLOCK_ID
  | typeof MARKDOWN_BUILTIN_INFOBOX_BLOCK_ID,
  T
>;

// export type BuiltinBlocks<T = unknown> = ReEarthBuiltinStoryBlocks<T> & UnsafeBuiltinBlocks<T>;
export type BuiltinInfoboxBlocks<T = unknown> = ReEarthBuiltinInfoboxBlocks<T>;

const reearthBuiltin: BuiltinInfoboxBlocks<Component> = {
  [IMAGE_BUILTIN_INFOBOX_BLOCK_ID]: ImageBlock,
  [TEXT_BUILTIN_INFOBOX_BLOCK_ID]: TextBlock,
  [PROPERTY_BUILTIN_INFOBOX_BLOCK_ID]: PropertyListBlock,
  [VIDEO_BUILTIN_INFOBOX_BLOCK_ID]: VideoBlock,
  [MARKDOWN_BUILTIN_INFOBOX_BLOCK_ID]: MarkdownBlock
};

const builtin = merge({}, reearthBuiltin);

export const isBuiltinInfoboxBlock = (
  id: string
): id is keyof BuiltinInfoboxBlocks => {
  return !!builtin[id as keyof BuiltinInfoboxBlocks];
};

export default builtin;
