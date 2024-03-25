import { spawn, type ModuleThread } from "threads";

import { type Worker } from "./worker";
import WorkerBlob from "./worker?worker&inline";

let worker: Promise<ModuleThread<Worker>>;

export async function getWorker(): typeof worker {
  if (worker == null) {
    worker = spawn<Worker>(new WorkerBlob());
  }
  return await worker;
}
