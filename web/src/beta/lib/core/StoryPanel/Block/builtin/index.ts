import { merge } from "lodash-es";

import { Component } from "..";
import {
  CAMERA_BUILTIN_STORY_BLOCK_ID,
  IMAGE_BUILTIN_STORY_BLOCK_ID,
  MD_BUILTIN_STORY_BLOCK_ID,
  TEXT_BUILTIN_STORY_BLOCK_ID,
  TITLE_BUILTIN_STORY_BLOCK_ID,
  VIDEO_BUILTIN_STORY_BLOCK_ID,
} from "../../constants";

import CameraBlock from "./Camera";
import ImageBlock from "./Image";
import MdBlock from "./Markdown";
import TextBlock from "./Text";
import TitleBlock from "./Title";
import VideoBlock from "./Video";

export type ReEarthBuiltinStoryBlocks<T = unknown> = Record<
  | typeof TITLE_BUILTIN_STORY_BLOCK_ID
  | typeof IMAGE_BUILTIN_STORY_BLOCK_ID
  | typeof TEXT_BUILTIN_STORY_BLOCK_ID
  | typeof VIDEO_BUILTIN_STORY_BLOCK_ID
  | typeof MD_BUILTIN_STORY_BLOCK_ID
  | typeof CAMERA_BUILTIN_STORY_BLOCK_ID,
  T
>;

// export type BuiltinBlocks<T = unknown> = ReEarthBuiltinStoryBlocks<T> & UnsafeBuiltinBlocks<T>;
export type BuiltinStoryBlocks<T = unknown> = ReEarthBuiltinStoryBlocks<T>;

const reearthBuiltin: BuiltinStoryBlocks<Component> = {
  [TITLE_BUILTIN_STORY_BLOCK_ID]: TitleBlock,
  [IMAGE_BUILTIN_STORY_BLOCK_ID]: ImageBlock,
  [TEXT_BUILTIN_STORY_BLOCK_ID]: TextBlock,
  [VIDEO_BUILTIN_STORY_BLOCK_ID]: VideoBlock,
  [MD_BUILTIN_STORY_BLOCK_ID]: MdBlock,
  [CAMERA_BUILTIN_STORY_BLOCK_ID]: CameraBlock,
};

const builtin = merge({}, reearthBuiltin);

export const isBuiltinStoryBlock = (id: string): id is keyof BuiltinStoryBlocks => {
  return !!builtin[id as keyof BuiltinStoryBlocks];
};

export default builtin;
