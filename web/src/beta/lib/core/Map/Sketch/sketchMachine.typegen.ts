// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {};
  missingImplementations: {
    actions: never;
    delays: never;
    guards: never;
    services: never;
  };
  eventsCausingActions: {
    clearDrawing: "CANCEL" | "CREATE";
    createCircle: "CIRCLE";
    createMarker: "MARKER";
    createPolygon: "POLYGON";
    createPolyline: "POLYLINE";
    createRectangle: "RECTANGLE";
    popPosition: "CANCEL";
    pushPosition: "EXTRUDE" | "NEXT";
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {
    canPopPosition: "CANCEL";
    willRectangleComplete: "NEXT";
  };
  eventsCausingServices: {};
  matchesStates:
    | "drawing"
    | "drawing.circle"
    | "drawing.circle.vertex"
    | "drawing.marker"
    | "drawing.marker.vertex"
    | "drawing.polygon"
    | "drawing.polygon.vertex"
    | "drawing.polyline"
    | "drawing.polyline.vertex"
    | "drawing.rectangle"
    | "drawing.rectangle.vertex"
    | "extruding"
    | "idle"
    | {
        drawing?:
          | "circle"
          | "marker"
          | "polygon"
          | "polyline"
          | "rectangle"
          | {
              circle?: "vertex";
              marker?: "vertex";
              polygon?: "vertex";
              polyline?: "vertex";
              rectangle?: "vertex";
            };
      };
  tags: never;
}
