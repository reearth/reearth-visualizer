import { merge } from "lodash-es";

import { Component } from "..";

import ImageBlock from "./Image";
import TextBlock from "./Text";
import VideoBlock from "./Video";

export const IMAGE_BUILTIN_STORY_BLOCK_ID = "reearth/imageStoryBlock";
export const TEXT_BUILTIN_STORY_BLOCK_ID = "reearth/textStoryBlock";
export const VIDEO_BUILTIN_STORY_BLOCK_ID = "reearth/videoStoryBlock";

export type ReEarthBuiltinStoryBlocks<T = unknown> = Record<
  | typeof IMAGE_BUILTIN_STORY_BLOCK_ID
  | typeof TEXT_BUILTIN_STORY_BLOCK_ID
  | typeof VIDEO_BUILTIN_STORY_BLOCK_ID,
  T
>;

// export type BuiltinBlocks<T = unknown> = ReEarthBuiltinStoryBlocks<T> & UnsafeBuiltinBlocks<T>;
export type BuiltinStoryBlocks<T = unknown> = ReEarthBuiltinStoryBlocks<T>;

const reearthBuiltin: BuiltinStoryBlocks<Component> = {
  [IMAGE_BUILTIN_STORY_BLOCK_ID]: ImageBlock,
  [TEXT_BUILTIN_STORY_BLOCK_ID]: TextBlock,
  [VIDEO_BUILTIN_STORY_BLOCK_ID]: VideoBlock,
};

const builtin = merge({}, reearthBuiltin);

export const isBuiltinStoryBlock = (id: string): id is keyof BuiltinStoryBlocks => {
  return !!builtin[id as keyof BuiltinStoryBlocks];
};

export default builtin;
