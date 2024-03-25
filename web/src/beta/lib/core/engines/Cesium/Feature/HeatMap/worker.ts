import { Transfer, type TransferDescriptor } from "threads";
import { expose } from "threads/worker";

import { fetchImageAndCreateMeshImageDataWorker, MeshImageData } from "./createMeshImageData";

export type CreateMeshImageDataParams = {
  canvas: OffscreenCanvas;
  url: string;
  reversingImageNeeded?: boolean;
};

const createMeshImageData = async (
  params: CreateMeshImageDataParams,
): Promise<TransferDescriptor<MeshImageData>> => {
  try {
    console.log("Worker: Creating mesh image data...");
    const result = await fetchImageAndCreateMeshImageDataWorker(
      params.canvas,
      params.url,
      params.reversingImageNeeded,
    );
    console.log("Worker: Mesh image data created successfully:", result);
    return Transfer(result, []);
  } catch (error) {
    console.error("Worker: Error creating mesh image data:", error);
    throw error;
  }
};

expose({
  createMeshImageData,
});

export type Worker = object & {
  createMeshImageData: (
    params: TransferDescriptor<CreateMeshImageDataParams>,
  ) => Promise<TransferDescriptor<MeshImageData>>;
};
