// TODO: Refactor: move cesium related code to engine.
import { Cartesian2, Cartesian3 } from "cesium";
import invariant from "tiny-invariant";
import { createMachine, type StateFrom } from "xstate";

import { type SketchGeometryType } from "./types";

export type EventObject =
  | ((
      | { type: "CIRCLE" }
      | { type: "RECTANGLE" }
      | { type: "POLYGON" }
      | { type: "MARKER" }
      | { type: "POLYLINE" }
      | { type: "NEXT" }
      | { type: "EXTRUDE" }
    ) & {
      pointerPosition: Cartesian2;
      controlPoint: Cartesian3;
    })
  | { type: "CREATE" }
  | { type: "CANCEL" };

interface Context {
  lastPointerPosition?: Cartesian2;
  lastControlPoint?: Cartesian3;
  type?: SketchGeometryType;
  controlPoints?: Cartesian3[];
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
            MARKER: {
              target: "drawing.marker",
              actions: ["createMarker"],
            },
            POLYLINE: {
              target: "drawing.polyline",
              actions: ["createPolyline"],
            },
          },
        },
        drawing: {
          states: {
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
                    EXTRUDE: {
                      target: "#sketch.extruding",
                      actions: ["pushPosition"],
                    },
                  },
                },
              },
            },
            marker: {
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
        createCircle: (context, event) => {
          context.lastPointerPosition = event.pointerPosition.clone();
          const controlPoint = event.controlPoint.clone();
          context.lastControlPoint = controlPoint;
          context.type = "circle";
          context.controlPoints = [controlPoint];
        },
        createRectangle: (context, event) => {
          context.lastPointerPosition = event.pointerPosition.clone();
          const controlPoint = event.controlPoint.clone();
          context.lastControlPoint = controlPoint;
          context.type = "rectangle";
          context.controlPoints = [controlPoint];
        },
        createPolygon: (context, event) => {
          context.lastPointerPosition = event.pointerPosition.clone();
          const controlPoint = event.controlPoint.clone();
          context.lastControlPoint = controlPoint;
          context.type = "polygon";
          context.controlPoints = [controlPoint];
        },
        createMarker: (context, event) => {
          context.lastPointerPosition = event.pointerPosition.clone();
          const controlPoint = event.controlPoint.clone();
          context.lastControlPoint = controlPoint;
          context.type = "marker";
          context.controlPoints = [controlPoint];
        },
        createPolyline: (context, event) => {
          context.lastPointerPosition = event.pointerPosition.clone();
          const controlPoint = event.controlPoint.clone();
          context.lastControlPoint = controlPoint;
          context.type = "polyline";
          context.controlPoints = [controlPoint];
        },
        pushPosition: (context, event) => {
          context.lastPointerPosition = event.pointerPosition.clone();
          const controlPoint = event.controlPoint.clone();
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
