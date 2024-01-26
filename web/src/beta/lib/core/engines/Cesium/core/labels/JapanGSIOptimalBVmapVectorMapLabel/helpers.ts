import { type Zxy } from "protomaps";

import { type ImageryCoords } from "./types";

export function makeKey({ x, y, level }: ImageryCoords): string {
  return `${level}:${x}:${y}`;
}

export function getTileCoords(coords: ImageryCoords, maximumDataLevel?: number): Zxy {
  if (maximumDataLevel != null && coords.level > maximumDataLevel) {
    // Clamp coordinates at the maximum data level.
    const scale = 2 ** (coords.level - maximumDataLevel);
    return {
      x: Math.floor(coords.x / scale),
      y: Math.floor(coords.y / scale),
      z: maximumDataLevel,
    };
  }
  return {
    x: coords.x,
    y: coords.y,
    z: coords.level,
  };
}
