import { engine as cesium } from "../engines/Cesium";

export const engines = {
  cesium,
};

export type EngineType = keyof typeof engines;
