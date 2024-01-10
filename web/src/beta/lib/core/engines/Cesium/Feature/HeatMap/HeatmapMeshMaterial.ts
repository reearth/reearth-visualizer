// ref: https://github.com/takram-design-engineering/plateau-view/blob/main/libs/heatmap/src/HeatmapMeshMaterial.ts

import { Cartesian2, Material, Rectangle } from "cesium";

import { Bound, LUT } from "@reearth/beta/lib/core/mantle";

import { createColorMapImage } from "./colorMap";
import { viridisColorMapLUT } from "./constants";
import heatmapMeshMaterial from "./shaders/heatmapMeshMaterial.glsl?raw";
import makeContour from "./shaders/makeContour.glsl?raw";
import sampleBicubic from "./shaders/sampleBicubic.glsl?raw";

export type HeatmapMeshMaterialOptions = {
  image: string | HTMLCanvasElement;
  width: number;
  height: number;
  minValue?: number;
  maxValue?: number;
  bound?: Bound;
  cropBound?: Bound;
  colorMapLUT?: LUT;
  opacity?: number;
  contourSpacing?: number;
  contourThickness?: number;
  contourAlpha?: number;
  logarithmic?: boolean;
};

export function createHeatmapMeshMaterial({
  image,
  width,
  height,
  minValue = 0,
  maxValue = 100,
  bound,
  cropBound,
  colorMapLUT = viridisColorMapLUT,
  opacity = 1,
  contourSpacing = 10,
  contourThickness = 1,
  contourAlpha = 0.2,
  logarithmic = false,
}: HeatmapMeshMaterialOptions): Material {
  const imageScale = new Cartesian2(1, 1);
  const imageOffset = new Cartesian2();
  const cropRectangle = new Rectangle(
    cropBound?.west,
    cropBound?.south,
    cropBound?.east,
    cropBound?.north,
  );
  const rectangle = new Rectangle(bound?.west, bound?.south, bound?.east, bound?.north);
  if (cropBound != null && rectangle != null && cropRectangle != null) {
    imageScale.x = cropRectangle.width / rectangle.width;
    imageScale.y = cropRectangle.height / rectangle.height;
    imageOffset.x = (cropRectangle.west - rectangle.west) / rectangle.width;
    imageOffset.y = (cropRectangle.south - rectangle.south) / rectangle.height;
  }

  return new Material({
    fabric: {
      type: "HeatmapMesh",
      uniforms: {
        colorMap: createColorMapImage(colorMapLUT),
        image,
        imageScale,
        imageOffset,
        width,
        height,
        minValue,
        maxValue,
        opacity,
        contourSpacing,
        contourThickness,
        contourAlpha,
        logarithmic,
      },
      source: [sampleBicubic, makeContour, heatmapMeshMaterial].join("\n"),
    },
  });
}
