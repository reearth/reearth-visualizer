import { FetchOptions, f } from "@reearth/beta/lib/core/mantle/data/utils";

export type MeshImageData = {
  image: HTMLCanvasElement;
  width: number;
  height: number;
  maxValue?: number;
  minValue?: number;
  outlierThreshold?: number;
};

export async function fetchImageAndCreateMeshImageData(
  url?: string,
  options?: FetchOptions,
): Promise<MeshImageData> {
  if (typeof url !== "string") {
    console.error("URL for valueMap is undefined");
    return Promise.reject("Invalid URL");
  }
  const imageBlob = await (await f(url, options)).blob();

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      resolve({
        image: canvas,
        width: img.width,
        height: img.height,
      });
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(imageBlob);
  });
}

export const MAX_VALUE = 0x7fffff;
export const MIN_VALUE = -0x800000;

function quantile(sortedValues: number[], q: number): number {
  const pos = (sortedValues.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;

  if (sortedValues[base + 1] !== undefined) {
    return sortedValues[base] + rest * (sortedValues[base + 1] - sortedValues[base]);
  } else {
    return sortedValues[base];
  }
}

export function reverseMeshDataAndComputeValues(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  scale = 1,
): Omit<MeshImageData, "image" | "width" | "height"> {
  let minValue = Infinity;
  let maxValue = -Infinity;
  const valuesForOutlierCalculation: number[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const b = data[i];
      const g = data[i + 1];
      const r = data[i + 2];
      const combined = (r << 16) | (g << 8) | b;
      let originalValue = combined - 0x800000;
      if (scale !== 1) {
        originalValue /= scale;
      }
      minValue = Math.min(minValue, originalValue);
      maxValue = Math.max(maxValue, originalValue);
      if (originalValue > 0) {
        valuesForOutlierCalculation.push(Math.abs(originalValue));
      }
    }
  }

  valuesForOutlierCalculation.sort((a, b) => a - b);
  const outlierThreshold = quantile(valuesForOutlierCalculation, 0.999) ?? 0;

  return {
    minValue,
    maxValue,
    outlierThreshold,
  };
}
