import { merge } from "lodash-es";

import { config } from "@reearth/services/config";

import type { Component } from "..";

import DataList from "./DataList";
import HTML from "./HTML";
import Image from "./Image";
import Location from "./Location";
import Text from "./Text";
import { unsafeBuiltinBlocks, type UnsafeBuiltinBlocks } from "./unsafeBlocks";
import Video from "./Video";

export const DATALIST_BUILTIN_BLOCK_ID = "reearth/dlblock";
export const IMAGE_BUILTIN_BLOCK_ID = "reearth/imageblock";
export const LOCATION_BUILTIN_BLOCK_ID = "reearth/locationblock";
export const TEXT_BUILTIN_BLOCK_ID = "reearth/textblock";
export const VIDEO_BUILTIN_BLOCK_ID = "reearth/videoblock";
export const HTML_BUILTIN_BLOCK_ID = "reearth/htmlblock";

export type ReEarthBuiltinBlocks<T = unknown> = Record<
  | typeof DATALIST_BUILTIN_BLOCK_ID
  | typeof IMAGE_BUILTIN_BLOCK_ID
  | typeof LOCATION_BUILTIN_BLOCK_ID
  | typeof TEXT_BUILTIN_BLOCK_ID
  | typeof VIDEO_BUILTIN_BLOCK_ID
  | typeof HTML_BUILTIN_BLOCK_ID,
  T
>;

export type BuiltinBlocks<T = unknown> = ReEarthBuiltinBlocks<T> & UnsafeBuiltinBlocks<T>;

const reearthBuiltin: BuiltinBlocks<Component> = {
  [DATALIST_BUILTIN_BLOCK_ID]: DataList,
  [IMAGE_BUILTIN_BLOCK_ID]: Image,
  [LOCATION_BUILTIN_BLOCK_ID]: Location,
  [TEXT_BUILTIN_BLOCK_ID]: Text,
  [VIDEO_BUILTIN_BLOCK_ID]: Video,
  [HTML_BUILTIN_BLOCK_ID]: HTML,
};

let cachedBuiltin: (ReEarthBuiltinBlocks<Component> & UnsafeBuiltinBlocks<Component>) | undefined =
  undefined;
const builtin = () => {
  if (cachedBuiltin) return cachedBuiltin;
  if (config()) {
    cachedBuiltin = merge({}, reearthBuiltin, unsafeBuiltinBlocks());
    return cachedBuiltin;
  } else {
    return reearthBuiltin;
  }
};

export const isBuiltinBlock = (id: string): id is keyof BuiltinBlocks => {
  return !!builtin()[id as keyof BuiltinBlocks];
};

export default builtin;
