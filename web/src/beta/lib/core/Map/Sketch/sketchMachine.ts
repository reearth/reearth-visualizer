// TODO: Refactor: move cesium related code to engine.
// import { Cartesian2, Cartesian3 } from "cesium";
import invariant from "tiny-invariant";
import { createMachine, type StateFrom } from "xstate";

import { type SketchType } from "./types";

export type Position2d = [number, number];
export type Position3d = [number, number, number];

export type EventObject =
  | ((
      | { type: "MARKER" }
      | { type: "POLYLINE" }
      | { type: "CIRCLE" }
      | { type: "RECTANGLE" }
      | { type: "POLYGON" }
      | { type: "EXTRUDED_CIRCLE" }
      | { type: "EXTRUDED_RECTANGLE" }
      | { type: "EXTRUDED_POLYGON" }
      | { type: "NEXT" }
      | { type: "EXTRUDE" }
    ) & {
      pointerPosition: Position2d;
      controlPoint: Position3d;
    })
  | { type: "CREATE" }
  | { type: "CANCEL" }
  | { type: "ABORT" };

interface Context {
  lastPointerPosition?: Position2d;
  lastControlPoint?: Position3d;
  type?: SketchType;
  controlPoints?: Position3d[];
}

export function createSketchMachine() {
  return createMachine(
    {
      id: "sketch",
      initial: "idle",
      context: {} as Context,
      states: {
        idle: {
          on: {
            MARKER: {
              target: "drawing.marker",
              actions: ["createMarker"],
            },
            POLYLINE: {
              target: "drawing.polyline",
              actions: ["createPolyline"],
            },
            CIRCLE: {
              target: "drawing.circle",
              actions: ["createCircle"],
            },
            RECTANGLE: {
              target: "drawing.rectangle",
              actions: ["createRectangle"],
            },
            POLYGON: {
              target: "drawing.polygon",
              actions: ["createPolygon"],
            },
            EXTRUDED_CIRCLE: {
              target: "drawing.circle",
              actions: ["createExtrudedCircle"],
            },
            EXTRUDED_RECTANGLE: {
              target: "drawing.extrudedRectangle",
              actions: ["createExtrudedRectangle"],
            },
            EXTRUDED_POLYGON: {
              target: "drawing.extrudedPolygon",
              actions: ["createExtrudedPolygon"],
            },
          },
        },
        drawing: {
          states: {
            marker: {
              initial: "vertex",
              states: {
                vertex: {},
              },
            },
            polyline: {
              initial: "vertex",
              states: {
                vertex: {
                  on: {
                    NEXT: {
                      target: "vertex",
                      internal: true,
                      actions: ["pushPosition"],
                    },
                  },
                },
              },
            },
            circle: {
              initial: "vertex",
              states: {
                vertex: {
                  on: {
                    NEXT: {
                      target: "#sketch.extruding",
                      actions: ["pushPosition"],
                    },
                  },
                },
              },
            },
            rectangle: {
              initial: "vertex",
              states: {
                vertex: {
                  on: {
                    NEXT: [
                      {
                        target: "vertex",
                        internal: true,
                        actions: ["pushPosition"],
                      },
                    ],
                  },
                },
              },
            },
            extrudedRectangle: {
              initial: "vertex",
              states: {
                vertex: {
                  on: {
                    NEXT: [
                      {
                        target: "#sketch.extruding",
                        cond: "willRectangleComplete",
                        actions: ["pushPosition"],
                      },
                      {
                        target: "vertex",
                        internal: true,
                        actions: ["pushPosition"],
                      },
                    ],
                  },
                },
              },
            },
            polygon: {
              initial: "vertex",
              states: {
                vertex: {
                  on: {
                    NEXT: {
                      target: "vertex",
                      internal: true,
                      actions: ["pushPosition"],
                    },
                  },
                },
              },
            },
            extrudedPolygon: {
              initial: "vertex",
              states: {
                vertex: {
                  on: {
                    NEXT: {
                      target: "vertex",
                      internal: true,
                      actions: ["pushPosition"],
                    },
                    EXTRUDE: {
                      target: "#sketch.extruding",
                      actions: ["pushPosition"],
                    },
                  },
                },
              },
            },
            history: {
              type: "history",
            },
          },
          on: {
            CANCEL: [
              {
                target: ".history",
                cond: "canPopPosition",
                actions: ["popPosition"],
              },
              {
                target: "idle",
                actions: ["clearDrawing"],
              },
            ],
            ABORT: {
              target: "idle",
              actions: ["clearDrawing"],
            },
            CREATE: {
              target: "idle",
              actions: ["clearDrawing"],
            },
          },
        },
        extruding: {
          on: {
            CREATE: {
              target: "idle",
              actions: ["clearDrawing"],
            },
            CANCEL: {
              target: "drawing.history",
              actions: ["popPosition"],
            },
            ABORT: {
              target: "idle",
              actions: ["clearDrawing"],
            },
          },
        },
      },
      schema: {
        events: {} as unknown as EventObject,
      },
      predictableActionArguments: true,
      preserveActionOrder: true,
      tsTypes: {} as import("./sketchMachine.typegen").Typegen0,
    },
    {
      guards: {
        canPopPosition: context => {
          return context.controlPoints != null && context.controlPoints.length > 1;
        },
        willRectangleComplete: context => {
          return context.controlPoints != null && context.controlPoints.length === 2;
        },
      },
      actions: {
        createMarker: (context, event) => {
          context.lastPointerPosition = [...event.pointerPosition];
          const controlPoint = [...event.controlPoint] as Position3d;
          context.lastControlPoint = controlPoint;
          context.type = "marker";
          context.controlPoints = [controlPoint];
        },
        createPolyline: (context, event) => {
          context.lastPointerPosition = [...event.pointerPosition];
          const controlPoint = [...event.controlPoint] as Position3d;
          context.lastControlPoint = controlPoint;
          context.type = "polyline";
          context.controlPoints = [controlPoint];
        },
        createCircle: (context, event) => {
          context.lastPointerPosition = [...event.pointerPosition];
          const controlPoint = [...event.controlPoint] as Position3d;
          context.lastControlPoint = controlPoint;
          context.type = "circle";
          context.controlPoints = [controlPoint];
        },
        createRectangle: (context, event) => {
          context.lastPointerPosition = [...event.pointerPosition];
          const controlPoint = [...event.controlPoint] as Position3d;
          context.lastControlPoint = controlPoint;
          context.type = "rectangle";
          context.controlPoints = [controlPoint];
        },
        createPolygon: (context, event) => {
          context.lastPointerPosition = [...event.pointerPosition];
          const controlPoint = [...event.controlPoint] as Position3d;
          context.lastControlPoint = controlPoint;
          context.type = "polygon";
          context.controlPoints = [controlPoint];
        },
        createExtrudedCircle: (context, event) => {
          context.lastPointerPosition = [...event.pointerPosition];
          const controlPoint = [...event.controlPoint] as Position3d;
          context.lastControlPoint = controlPoint;
          context.type = "extrudedCircle";
          context.controlPoints = [controlPoint];
        },
        createExtrudedRectangle: (context, event) => {
          context.lastPointerPosition = [...event.pointerPosition];
          const controlPoint = [...event.controlPoint] as Position3d;
          context.lastControlPoint = controlPoint;
          context.type = "extrudedRectangle";
          context.controlPoints = [controlPoint];
        },
        createExtrudedPolygon: (context, event) => {
          context.lastPointerPosition = [...event.pointerPosition];
          const controlPoint = [...event.controlPoint] as Position3d;
          context.lastControlPoint = controlPoint;
          context.type = "extrudedPolygon";
          context.controlPoints = [controlPoint];
        },
        pushPosition: (context, event) => {
          context.lastPointerPosition = [...event.pointerPosition];
          const controlPoint = [...event.controlPoint] as Position3d;
          context.lastControlPoint = controlPoint;
          context.controlPoints?.push(controlPoint);
        },
        popPosition: context => {
          invariant(context.controlPoints != null);
          invariant(context.controlPoints.length > 1);
          context.controlPoints.pop();
        },
        clearDrawing: context => {
          delete context.lastControlPoint;
          delete context.type;
          delete context.controlPoints;
        },
      },
    },
  );
}

export type SketchMachine = ReturnType<typeof createSketchMachine>;
export type SketchMachineState = StateFrom<SketchMachine>;
