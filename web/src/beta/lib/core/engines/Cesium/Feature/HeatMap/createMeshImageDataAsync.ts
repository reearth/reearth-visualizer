import { Transfer } from "threads";

import type { MeshImageData } from "./createMeshImageData";
import { getWorker } from "./workerPool";

export async function createMeshDataAsync(options: {
  canvas: HTMLCanvasElement;
  url: string;
  reversingImageNeeded?: boolean;
}): Promise<MeshImageData> {
  const { canvas, ...optionsWithoutCanvas } = options;
  const offscreen = canvas.transferControlToOffscreen();
  const worker = await getWorker();

  const result = await worker.createMeshImageData(
    Transfer({ canvas: offscreen, ...optionsWithoutCanvas }, [offscreen]),
  );

  return result;
}
