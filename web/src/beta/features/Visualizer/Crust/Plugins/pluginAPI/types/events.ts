// import {
//   // LayerEditEvent,
//   // LayerLoadEvent,
//   LayerSelectWithRectEnd,
//   LayerSelectWithRectMove,
//   LayerSelectWithRectStart,
//   // LayerVisibilityEvent,
//   // SketchEventProps,
//   // SketchType,
//   // TimelineCommitter,
// } from "@reearth/core";

// // import { CameraPosition } from "./camera";
// // import { ViewportSize } from "./viewer";

// export declare type Events = {
//   readonly on: <T extends keyof ReearthEventType>(
//     type: T,
//     callback: (...args: ReearthEventType[T]) => void,
//   ) => void;
//   readonly off: <T extends keyof ReearthEventType>(
//     type: T,
//     callback: (...args: ReearthEventType[T]) => void,
//   ) => void;
//   readonly once: <T extends keyof ReearthEventType>(
//     type: T,
//     callback: (...args: ReearthEventType[T]) => void,
//   ) => void;
// };

// export declare type ReearthEvents<E extends keyof ReearthEventType> = {
//   readonly on: <T extends E>(
//     type: T,
//     callback: (...args: ReearthEventType[T]) => void,
//     options: { once?: boolean },
//   ) => void;
//   readonly off: <T extends E>(type: T, callback: (...args: ReearthEventType[T]) => void) => void;
// };

// export declare type ReearthEventType = {
//   update: [];
//   close: [];
//   // cameramove: [camera: CameraPosition];
//   // layeredit: [e: LayerEditEvent];
//   select: [layerId: string | undefined, featureId: string | undefined];
//   message: [message: unknown];
//   // click: [e: MouseEvent];
//   // doubleclick: [e: MouseEvent];
//   // mousedown: [e: MouseEvent];
//   // mouseup: [e: MouseEvent];
//   // rightclick: [e: MouseEvent];
//   // rightdown: [e: MouseEvent];
//   // rightup: [e: MouseEvent];
//   // middleclick: [e: MouseEvent];
//   // middledown: [e: MouseEvent];
//   // middleup: [e: MouseEvent];
//   // mousemove: [e: MouseEvent];
//   // mouseenter: [e: MouseEvent];
//   // mouseleave: [e: MouseEvent];
//   // wheel: [e: MouseEvent];
//   // tick: [e: Date];
//   // timelinecommit: [e: TimelineCommitter];
//   // resize: [e: ViewportSize];
//   modalclose: [];
//   popupclose: [];
//   pluginmessage: [props: PluginMessage];
//   // sketchfeaturecreated: [props: SketchEventProps];
//   // sketchtoolchange: [props: SketchType | undefined];
//   // layerVisibility: [e: LayerVisibilityEvent];
//   // layerload: [e: LayerLoadEvent];
//   layerSelectWithRectStart: [e: LayerSelectWithRectStart];
//   layerSelectWithRectMove: [e: LayerSelectWithRectMove];
//   layerSelectWithRectEnd: [e: LayerSelectWithRectEnd];
// };

// export declare type PluginMessage = {
//   data: unknown;
//   sender: string;
// };
