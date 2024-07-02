import { Block } from "./block";
import { Camera } from "./camera";
import { ClientStorage } from "./clientStorage";
import { Engine } from "./engine";
import { Events } from "./events";
import { Layers } from "./layers";
import { Modal } from "./modal";
import { Popup } from "./popup";
import { Sketch } from "./sketch";
import { Timeline } from "./timeline";
import { Tools } from "./tools";
import { UI } from "./ui";
import { Viewer } from "./viewer";
import { Widget } from "./widget";

export declare type Reearth = {
  // system
  readonly version: string;
  readonly apiVersion: string;
  readonly engine: Engine;
  // viewer
  readonly viewer: Viewer;
  readonly camera: Camera;
  readonly timeline: Timeline;
  // layers
  readonly layers: Layers;
  // plugin ui
  readonly ui: UI;
  readonly modal: Modal;
  readonly popup: Popup;
  // plugin data
  readonly widget?: Widget;
  readonly block?: Block;
  readonly plugin?: Plugin;
  readonly clientStorage: ClientStorage;
  // functions
  readonly sketch: Sketch;
  // tools
  readonly tools: Tools;
} & Events;

export type GlobalThis = {
  reearth: Reearth;
  console: {
    readonly log: (...args: unknown[]) => void;
    readonly error: (...args: unknown[]) => void;
  };
};
