import tinycolor, { ColorInput } from "tinycolor2";

import { RGBA } from "./types";

export const getHexString = (value?: ColorInput) => {
  if (!value) return undefined;
  const color = tinycolor(value);
  return color.getAlpha() === 1 ? color.toHexString() : color.toHex8String();
};

export const getChannelLabel = (channel: string) => {
  switch (channel) {
    case "r":
      return "Red";
    case "g":
      return "Green";
    case "b":
      return "Blue";
    case "a":
      return "Alpha";
    default:
      return "";
  }
};

export function getChannelValue(rgba: RGBA, channel: keyof RGBA): number {
  return rgba[channel];
}
