import { merge } from "lodash-es";

import { Component } from "..";

import ImageBlock from "./Image";

export const IMAGE_BUILTIN_STORY_BLOCK_ID = "reearth/imageStoryBlock";

export type ReEarthBuiltinStoryBlocks<T = unknown> = Record<typeof IMAGE_BUILTIN_STORY_BLOCK_ID, T>;

// export type BuiltinBlocks<T = unknown> = ReEarthBuiltinStoryBlocks<T> & UnsafeBuiltinBlocks<T>;
export type BuiltinStoryBlocks<T = unknown> = ReEarthBuiltinStoryBlocks<T>;

const reearthBuiltin: BuiltinStoryBlocks<Component> = {
  [IMAGE_BUILTIN_STORY_BLOCK_ID]: ImageBlock,
};

const builtin = merge({}, reearthBuiltin);

export const isBuiltinStoryBlock = (id: string): id is keyof BuiltinStoryBlocks => {
  return !!builtin[id as keyof BuiltinStoryBlocks];
};

export default builtin;
