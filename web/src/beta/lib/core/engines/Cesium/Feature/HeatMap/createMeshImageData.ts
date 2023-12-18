import { quantile } from "d3";

export type MeshImageData = {
  image: HTMLCanvasElement;
  width: number;
  height: number;
  maxValue?: number;
  minValue?: number;
  outlierThreshold?: number;
};

export async function fetchImageAndCreateMeshImageData(
  url: string,
  reversingImageNeeded?: boolean,
): Promise<MeshImageData> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return Promise.reject("Failed to create canvas context");
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, img.width, img.height).data;
      const { minValue, maxValue, outlierThreshold } = reversingImageNeeded
        ? reverseMeshDataAndComputeValues(imageData, img.width, img.height)
        : {
            minValue: 0,
            maxValue: 100,
            outlierThreshold: 100,
          };

      resolve({
        image: canvas,
        width: img.width,
        height: img.height,
        minValue,
        maxValue,
        outlierThreshold,
      });
    };
    img.onerror = reject;

    if (url.startsWith("data:image")) {
      img.src = url;
    } else {
      fetch(url)
        .then(response => response.blob())
        .then(blob => {
          img.src = URL.createObjectURL(blob);
        })
        .catch(reject);
    }
  });
}

function computeOutlierThreshold(values: number[]): number {
  return (
    quantile(
      values.filter(value => value > 0),
      0.999,
    ) ?? 0
  );
}

function reverseMeshDataAndComputeValues(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  scale = 1,
): Omit<MeshImageData, "image" | "width" | "height"> {
  let minValue = Infinity;
  let maxValue = -Infinity;
  const valuesForOutlierCalculation = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      let originalValue = ((((r << 16) >>> 0) + ((g << 8) >>> 0) + b) >>> 0) - 0x800000;

      if (scale !== 1) {
        originalValue /= scale;
      }

      minValue = Math.min(minValue, originalValue);
      maxValue = Math.max(maxValue, originalValue);

      valuesForOutlierCalculation.push(Math.abs(originalValue));
    }
  }

  const outlierThreshold = computeOutlierThreshold(valuesForOutlierCalculation);

  return {
    minValue,
    maxValue,
    outlierThreshold,
  };
}
