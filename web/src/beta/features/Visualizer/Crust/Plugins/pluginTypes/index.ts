import { Camera } from "./camera";
import { Cesium } from "./cesium";
import { Engine } from "./engine";
import { Layers } from "./layers";
import { Modal } from "./modal";
import { Popup } from "./popup";
import { Timeline } from "./timeline";
import { UI } from "./ui";

export type GlobalThis = {
  Cesium?: Cesium;
  reearth: Reearth;
  console: {
    readonly log: (...args: any[]) => void;
    readonly error: (...args: any[]) => void;
  };
};

export declare type Reearth = {
  readonly version: string; // e.g. "1.0.0"
  readonly apiVersion: string; // e.g. "1.0.0"
  readonly engine: Engine;
  //
  readonly camera: Camera;
  readonly timeline: Timeline;
  //
  readonly ui: UI;
  readonly modal: Modal;
  readonly popup: Popup;
  //
  readonly layers: Layers;
};
