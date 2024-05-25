import tinycolor, { ColorInput } from "tinycolor2";

import { RGBA } from "@reearth/beta/lib/reearth-ui/components/ColorInput";

export const getHexString = (value?: ColorInput) => {
  if (!value) return undefined;
  const color = tinycolor(value);
  return color.getAlpha() === 1 ? color.toHexString() : color.toHex8String();
};

export function getChannelValue(rgba: RGBA, channel: keyof RGBA): number {
  return rgba[channel];
}

export const checkRgbaRange = (value: string | number, min: number, max: number) => {
  let numericValue = parseFloat(value.toString());
  if (isNaN(numericValue) || numericValue < min || numericValue > max) {
    numericValue = max;
  }
  return numericValue;
};
