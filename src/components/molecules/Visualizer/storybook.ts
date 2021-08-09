import { action } from "@storybook/addon-actions";
import type { VisualizerContext, GlobalThis } from "./context";
import type { Primitive } from ".";

const primitives: Primitive[] = [
  {
    id: "a",
    title: "A",
    isVisible: true,
    property: {
      default: {
        location: {
          lat: 10,
          lng: 10,
        },
        height: 10,
      },
    },
  },
  {
    id: "b",
    title: "B",
    isVisible: true,
    property: {
      default: {
        location: {
          lat: 20,
          lng: 20,
        },
        height: 20,
      },
    },
  },
  {
    id: "c",
    title: "C",
    isVisible: true,
    property: {
      default: {
        location: {
          lat: 30,
          lng: 30,
        },
        height: 30,
      },
    },
  },
];

export const context: VisualizerContext = {
  engine: {
    name: "cesium",
    getCamera() {
      return {
        lat: 0,
        lng: 0,
        height: 0,
        heading: 0,
        pitch: 0,
        roll: 0,
        fov: Math.PI * (60 / 180),
      };
    },
    flyTo: act("flyTo"),
    lookAt: act("lookAt"),
    zoomIn: act("zoomIn"),
    zoomOut: act("zoomOut"),
    requestRender: act("requestRender"),
    getLocationFromScreenXY: act("getLocationFromScreenXY", () => undefined),
  },
  pluginAPI: {
    console: {
      log: act("console.log"),
      error: act("console.error"),
    },
    reearth: {
      version: "0.0.0",
      apiVersion: 0,
      primitives: {
        primitives,
        select: act("primitive.select"),
        show: act("primitive.show"),
        hide: act("primitive.hide"),
      },
      visualizer: {
        engine: "cesium",
        camera: {
          lat: 0,
          lng: 0,
          height: 0,
          heading: 0,
          pitch: 0,
          roll: 0,
          fov: Math.PI * (60 / 180),
        },
        flyTo: act("visualizer.flyTo"),
        lookAt: act("visualizer.lookAt"),
        zoomIn: act("visualizer.zoomIn"),
        zoomOut: act("visualizer.zoomOut"),
      },
      on: act("reearth.on"),
      off: act("reearth.off"),
      once: act("reearth.once"),
    },
  } as GlobalThis,
};

function act<T extends any[], M extends (...args: T) => any>(
  name: string,
  mock?: M,
): (...args: T) => ReturnType<M> {
  const a = action(`Common API: ${name}`);
  return (...args) => {
    a(...args);
    return mock?.(...args);
  };
}
