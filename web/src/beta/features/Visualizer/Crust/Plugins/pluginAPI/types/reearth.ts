import { Camera } from "./camera";
import { Data } from "./data";
import { Engine } from "./engine";
import { Extension } from "./extension";
import { Layers } from "./layers";
import { Modal } from "./modal";
import { Popup } from "./popup";
import { Sketch } from "./sketch";
import { Timeline } from "./timeline";
import { UI } from "./ui";
import { Viewer } from "./viewer";

export declare type Reearth = {
  // system
  readonly version: string;
  readonly apiVersion: string;
  readonly engine: Engine;
  // viewer
  readonly viewer: Viewer;
  readonly camera: Camera;
  readonly timeline: Timeline;
  // functions
  readonly sketch: Sketch;
  // layers
  readonly layers: Layers;
  // ui
  readonly ui: UI;
  readonly modal: Modal;
  readonly popup: Popup;
  // extension
  readonly extension: Extension;
  // data
  readonly data: Data;
};
