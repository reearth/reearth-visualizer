import {
  LayerEditEvent,
  LayerLoadEvent,
  LayerSelectWithRectEnd,
  LayerSelectWithRectMove,
  LayerSelectWithRectStart,
  LayerVisibilityEvent,
  SketchEventProps,
  SketchType,
  TimelineCommitter,
} from "@reearth/core";

import { CameraPosition } from "./camera";
import { ViewportSize } from "./viewer";

export declare type Events = {
  readonly on: <T extends keyof ReearthEventType>(
    type: T,
    callback: (...args: ReearthEventType[T]) => void,
  ) => void;
  readonly off: <T extends keyof ReearthEventType>(
    type: T,
    callback: (...args: ReearthEventType[T]) => void,
  ) => void;
  readonly once: <T extends keyof ReearthEventType>(
    type: T,
    callback: (...args: ReearthEventType[T]) => void,
  ) => void;
};

export declare type ReearthEventType = {
  update: [];
  close: [];
  cameramove: [camera: CameraPosition];
  layeredit: [e: LayerEditEvent];
  select: [layerId: string | undefined, featureId: string | undefined];
  message: [message: unknown];
  click: [props: MouseEvent];
  doubleclick: [props: MouseEvent];
  mousedown: [props: MouseEvent];
  mouseup: [props: MouseEvent];
  rightclick: [props: MouseEvent];
  rightdown: [props: MouseEvent];
  rightup: [props: MouseEvent];
  middleclick: [props: MouseEvent];
  middledown: [props: MouseEvent];
  middleup: [props: MouseEvent];
  mousemove: [props: MouseEvent];
  mouseenter: [props: MouseEvent];
  mouseleave: [props: MouseEvent];
  wheel: [props: MouseEvent];
  tick: [props: Date];
  timelinecommit: [props: TimelineCommitter];
  resize: [props: ViewportSize];
  modalclose: [];
  popupclose: [];
  pluginmessage: [props: PluginMessage];
  sketchfeaturecreated: [props: SketchEventProps];
  sketchtypechange: [props: SketchType | undefined];
  layerVisibility: [e: LayerVisibilityEvent];
  layerload: [e: LayerLoadEvent];
  layerSelectWithRectStart: [e: LayerSelectWithRectStart];
  layerSelectWithRectMove: [e: LayerSelectWithRectMove];
  layerSelectWithRectEnd: [e: LayerSelectWithRectEnd];
};

export declare type PluginMessage = {
  data: unknown;
  sender: string;
};
