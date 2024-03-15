import { type TransferDescriptor } from "threads";
import { expose } from "threads/worker";

import { fetchImageAndCreateMeshImageData, MeshImageData } from "./createMeshImageData";

export interface WorkerCreateMeshImageDataParams {
  url: string;
  reversingImageNeeded?: boolean;
}

expose({
  createMeshImageData: ({
    url,
    reversingImageNeeded,
  }: WorkerCreateMeshImageDataParams): Promise<MeshImageData> => {
    return fetchImageAndCreateMeshImageData(url, reversingImageNeeded);
  },
});

export type Worker = object & {
  createMeshImageData: (
    params: TransferDescriptor<WorkerCreateMeshImageDataParams>,
  ) => Promise<MeshImageData>;
};
