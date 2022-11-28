import { action } from "@storybook/addon-actions";
import type { ReactNode } from "react";

import type { ProviderProps } from "./Plugin";
import { Provider as PluginProvider } from "./Plugin";

import { Layer, LayerStore } from ".";

const layers: Layer[] = [
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

export function Provider({ children }: { children?: ReactNode }) {
  return <PluginProvider {...context}>{children}</PluginProvider>;
}

export const context: ProviderProps = {
  engineName: "cesium",
  engine: {},
  inEditor: false,
  hideLayer: act("layers.hide"),
  showLayer: act("layers.show"),
  selectLayer: act("layers.select"),
  addLayer: act("layers.add"),
  camera: {
    lat: 0,
    lng: 0,
    height: 0,
    heading: 0,
    pitch: 0,
    roll: 0,
    fov: Math.PI * (60 / 180),
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
  },
  layers: new LayerStore({ id: "", children: layers }),
  flyTo: act("flyTo"),
  lookAt: act("lookAt"),
  zoomIn: act("zoomIn"),
  zoomOut: act("zoomOut"),
  rotateRight: act("rotateRight"),
  orbit: act("orbit"),
  overrideLayerProperty: act("overrideLayerProperty"),
  overrideSceneProperty: act("overrideSceneProperty"),
  layersInViewport: act("layersInViewport"),
  cameraViewport: act("cameraViewport"),
  onMouseEvent: act("onMouseEvent"),
  captureScreen: act("captureScreen"),
  getLocationFromScreen: act("getLocationFromScreen"),
  enableScreenSpaceCameraController: act("enableScreenSpaceCameraController"),
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
  moveWidget: act("moveWidget"),
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
