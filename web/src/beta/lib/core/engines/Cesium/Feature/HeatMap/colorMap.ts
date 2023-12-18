// ref: https://github.com/takram-design-engineering/plateau-view/blob/main/libs/color-maps/src/ColorMap.ts

import { interpolate, quantize, rgb, scaleLinear, type ScaleLinear } from "d3";
import invariant from "tiny-invariant";

import type { ColorTuple, LUT } from "@reearth/beta/lib/core/mantle";

export type ColorMapType = "sequential" | "diverging";

function createScaleLinear(lut: LUT): ScaleLinear<ColorTuple, ColorTuple> {
  invariant(lut.length > 1);
  return scaleLinear<ColorTuple>()
    .domain(quantize(interpolate(0, 1), lut.length))
    .range(lut)
    .clamp(true);
}

export function linearColorMap(lut: LUT, value: number): ColorTuple {
  const scaleLinear = createScaleLinear(lut);
  const result = scaleLinear(value);
  invariant(result != null);
  return result;
}

export function countColorMap(lut: LUT): number {
  return lut.length;
}

export function quantizeColorMap(lut: LUT, count: number): ColorTuple[] {
  invariant(count > 1);
  return [...Array(count)].map((_, index) => {
    return linearColorMap(lut, index / (count - 1));
  });
}

export function createColorMapImage(lut: LUT): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = lut.length;
  canvas.height = 1;
  const context = canvas.getContext("2d");
  invariant(context != null);
  lut.forEach(([r, g, b], index) => {
    context.fillStyle = rgb(r * 255, g * 255, b * 255).toString();
    context.fillRect(index, 0, 1, 1);
  });
  return canvas;
}
