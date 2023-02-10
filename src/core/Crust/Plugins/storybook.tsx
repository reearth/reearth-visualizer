import { action } from "@storybook/addon-actions";
import type { ReactNode } from "react";

import { Layer } from "../../mantle";

import { PluginProvider } from "./context";
import type { Context } from "./types";

const layers: Layer[] = [
  {
    id: "a",
    title: "A",
    type: "simple",
    data: {
      type: "geojson",
      value: { type: "Feature", geometry: { type: "Point", coordinates: [0, 0] } },
    },
    marker: {
      imageColor: "#fff",
    },
    properties: {
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
    type: "simple",
    data: {
      type: "geojson",
      value: { type: "Feature", geometry: { type: "Point", coordinates: [0, 0] } },
    },
    marker: {
      imageColor: "#fff",
    },
    properties: {
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
    type: "simple",
    data: {
      type: "geojson",
      value: { type: "Feature", geometry: { type: "Point", coordinates: [0, 0] } },
    },
    marker: {
      imageColor: "#fff",
    },
    properties: {
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

export function Provider({ children }: { children?: ReactNode }) {
  return <PluginProvider value={context}>{children}</PluginProvider>;
}

export const context: Context = {
  reearth: {
    engineName: "cesium",
    version: "",
    apiVersion: 0,
    visualizer: {} as any,
    plugins: {
      get instances() {
        return [];
      },
    },
    scene: {
      inEditor: false,
      overrideProperty: act("overrideSceneProperty"),
      captureScreen: act("captureScreen"),
      getLocationFromScreen: act("getLocationFromScreen"),
    },
    layers: {
      hide: act("layers.hide"),
      show: act("layers.show"),
      select: act("layers.select"),
      add: act("layers.add"),
      findById: act("layers.findById"),
      findByIds: act("layers.findByIds"),
      walk: act("layers.walk"),
      find: act("layers.find"),
      override: act("layers.override"),
      replace: act("layers.replace"),
      delete: act("layers.delete"),
      findAll: act("layers.findAll"),
      findByTags: act("layers.findByTags"),
      findByTagLabels: act("layers.findByTagLabels"),
      layersInViewport: act("layersInViewport"),
      layers,
    },
    camera: {
      position: {
        lat: 0,
        lng: 0,
        height: 0,
        heading: 0,
        pitch: 0,
        roll: 0,
        fov: Math.PI * (60 / 180),
      },
      viewport: { west: 0, east: 0, north: 0, south: 0 },
      enableScreenSpaceController: act("enableScreenSpaceController"),
      flyTo: act("flyTo"),
      lookAt: act("lookAt"),
      zoomIn: act("zoomIn"),
      zoomOut: act("zoomOut"),
      rotateRight: act("rotateRight"),
      orbit: act("orbit"),
      lookHorizontal: act("lookHorizontal"),
      lookVertical: act("lookVertical"),
      moveForward: act("moveForward"),
      moveBackward: act("moveBackward"),
      moveUp: act("moveUp"),
      moveDown: act("moveDown"),
      moveLeft: act("moveLeft"),
      moveRight: act("moveRight"),
      moveOverTerrain: act("moveOverTerrain"),
      flyToGround: act("flyToGround"),
    },
    clock: {
      startTime: new Date("2022-06-01"),
      stopTime: new Date("2022-06-03"),
      currentTime: new Date("2022-06-02"),
      playing: false,
      paused: true,
      speed: 1,
      play: () => {},
      pause: () => {},
      tick: () => new Date("2022-06-03"),
    },
    viewport: {
      width: 1280,
      height: 720,
      isMobile: false,
      query: {},
    },
    on: act("on"),
    off: act("off"),
    once: act("once"),
  },
  pluginInstances: {
    meta: {
      current: [],
    },
    postMessage: () => {},
    addPluginMessageSender: () => {},
    removePluginMessageSender: () => {},
    runTimesCache: {
      get: () => 1,
      increment: () => {},
      decrement: () => {},
      clear: () => {},
      clearAll: () => {},
    },
  },
  clientStorage: {
    getAsync: act("clientStorage.getAsync"),
    setAsync: act("clientStorage.setAsync"),
    deleteAsync: act("clientStorage.deleteAsync"),
    keysAsync: act("clientStorage.keysAsync"),
    dropStore: () => {
      return new Promise<void>(resolve => {
        resolve();
      });
    },
  },
  overrideSceneProperty: act("overrideSceneProperty"),
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
