import { Transfer } from "threads";

import { MeshImageData } from "./createMeshImageData";
import { queue } from "./getWorker";

export async function createMeshImageDataAsync(
  url: string,
  reversingImageNeeded?: boolean,
): Promise<MeshImageData> {
  return new Promise((resolve, reject) => {
    queue(async task => {
      try {
        const result = await task.createMeshImageData(
          Transfer(
            {
              url,
              reversingImageNeeded,
            },
            [],
          ),
        );
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  });
}
