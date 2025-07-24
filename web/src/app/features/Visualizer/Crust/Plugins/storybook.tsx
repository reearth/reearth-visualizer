import { Layer } from "@reearth/core";
import { action } from "@storybook/addon-actions";
import type { ReactNode } from "react";

import { PluginProvider } from "./context";
import type { Context } from "./types";

const layers: Layer[] = [
  {
    id: "a",
    title: "A",
    type: "simple",
    data: {
      type: "geojson",
      value: {
        type: "Feature",
        geometry: { type: "Point", coordinates: [0, 0] }
      }
    },
    marker: {
      imageColor: "#fff"
    },
    properties: {
      default: {
        location: {
          lat: 10,
          lng: 10
        },
        height: 10
      }
    }
  },
  {
    id: "b",
    title: "B",
    type: "simple",
    data: {
      type: "geojson",
      value: {
        type: "Feature",
        geometry: { type: "Point", coordinates: [0, 0] }
      }
    },
    marker: {
      imageColor: "#fff"
    },
    properties: {
      default: {
        location: {
          lat: 20,
          lng: 20
        },
        height: 20
      }
    }
  },
  {
    id: "c",
    title: "C",
    type: "simple",
    data: {
      type: "geojson",
      value: {
        type: "Feature",
        geometry: { type: "Point", coordinates: [0, 0] }
      }
    },
    marker: {
      imageColor: "#fff"
    },
    properties: {
      default: {
        location: {
          lat: 30,
          lng: 30
        },
        height: 30
      }
    }
  }
];

export function Provider({ children }: { children?: ReactNode }) {
  return <PluginProvider value={context}>{children}</PluginProvider>;
}

export const context: Context = {
  reearth: {
    engine: {
      name: "cesium"
    },
    version: "1.0.0",
    apiVersion: "2.0.0",
    viewer: {
      property: {},
      overrideProperty: act("overrideViewerProperty"),
      viewport: {
        width: 1280,
        height: 720,
        isMobile: false,
        query: {}
      },
      interactionMode: {
        mode: "default",
        override: act("overrideInteractionMode"),
        selectionMode: {
          on: act("selectionMode.on"),
          off: act("selectionMode.off")
        }
      },
      env: {
        inEditor: true,
        isBuilt: false
      },
      capture: act("captureScreen"),
      tools: {
        getLocationFromScreenCoordinate: act("getLocationFromScreenCoordinate"),
        getScreenCoordinateFromPosition: act("getScreenCoordinateFromPosition"),
        getTerrainHeightAsync: act("getTerrainHeightAsync"),
        getCurrentLocationAsync: act("getCurrentLocationAsync"),
        getGlobeHeight: act("getGlobeHeight"),
        getGlobeHeightByCamera: act("getGlobeHeightByCamera"),
        cartographicToCartesian: act("cartographicToCartesian"),
        cartesianToCartographic: act("cartesianToCartographic"),
        transformByOffsetOnScreen: act("transformByOffsetOnScreen"),
        isPositionVisibleOnGlobe: act("isPositionVisibleOnGlobe"),
        getGeoidHeight: act("getGeoidHeight")
      },
      on: act("on"),
      off: act("off")
    },
    camera: {
      position: { lat: 0, lng: 0, height: 0, heading: 0, pitch: 0, roll: 0 },
      fov: Math.PI * (60 / 180),
      aspectRatio: 16 / 9,
      viewport: { west: 0, east: 0, north: 0, south: 0 },
      flyTo: act("flyTo"),
      flyToBoundingBox: act("flyToBoundingBox"),
      zoomIn: act("zoomIn"),
      zoomOut: act("zoomOut"),
      lookAt: act("lookAt"),
      rotateAround: act("rotateAround"),
      rotateRight: act("rotateRight"),
      orbit: act("orbit"),
      getGlobeIntersection: act("getGlobeIntersection"),
      enableScreenSpaceCameraController: act(
        "enableScreenSpaceCameraController"
      ),
      overrideScreenSpaceCameraController: act(
        "overrideScreenSpaceCameraController"
      ),
      move: act("move"),
      moveOverTerrain: act("moveOverTerrain"),
      setView: act("setView"),
      enableForceHorizontalRoll: act("enableForceHorizontalRoll"),
      on: act("on"),
      off: act("off")
    },
    timeline: {
      startTime: new Date("2022-06-01"),
      stopTime: new Date("2022-06-03"),
      currentTime: new Date("2022-06-02"),
      isPlaying: false,
      speed: 1,
      tick: act("tick"),
      play: act("play"),
      pause: act("pause"),
      setTime: act("setTime"),
      setSpeed: act("setSpeed"),
      setStepType: act("setStepType"),
      setRangeType: act("setRangeType"),
      on: act("on"),
      off: act("off")
    },
    sketch: {
      tool: undefined,
      options: undefined,
      setTool: act("setTool"),
      overrideOptions: act("overrideOptions"),
      on: act("on"),
      off: act("off")
    },
    spatialId: {
      pickSpace: act("pickSpace"),
      exitPickSpace: act("exitPickSpace"),
      on: act("on"),
      off: act("off")
    },
    layers: {
      layers,
      hide: act("layers.hide"),
      show: act("layers.show"),
      add: act("layers.add"),
      delete: act("layers.delete"),
      override: act("layers.override"),
      overridden: [],
      find: act("layers.find"),
      findAll: act("layers.findAll"),
      findById: act("layers.findById"),
      findByIds: act("layers.findByIds"),
      findFeatureById: act("layers.findFeatureById"),
      findFeaturesByIds: act("layers.findFeaturesByIds"),
      select: act("layers.select"),
      selectFeature: act("layers.selectFeature"),
      selectFeatures: act("layers.selectFeatures"),
      selected: undefined,
      selectedFeature: undefined,
      bringToFront: act("layers.bringToFront"),
      sendToBack: act("layers.sendToBack"),
      getFeaturesInScreenRect: act("layers.getFeaturesInScreenRect"),
      on: act("layers.on"),
      off: act("layers.off")
    },
    extension: {
      get list() {
        return [];
      }
    }
  },
  pluginInstances: {
    meta: {
      current: []
    },
    postMessage: () => {},
    addPluginMessageSender: () => {},
    removePluginMessageSender: () => {},
    runTimesCache: {
      get: () => 1,
      increment: () => {},
      decrement: () => {},
      clear: () => {},
      clearAll: () => {}
    }
  },
  clientStorage: {
    getAsync: act("clientStorage.getAsync"),
    setAsync: act("clientStorage.setAsync"),
    deleteAsync: act("clientStorage.deleteAsync"),
    keysAsync: act("clientStorage.keysAsync"),
    dropStore: act("clientStorage.dropStoreAsync")
  },
  overrideViewerProperty: act("overrideViewerProperty"),
  viewerEvents: {
    on: act("viewerEvents.on"),
    off: act("viewerEvents.off"),
    once: act("viewerEvents.once")
  },
  selectionModeEvents: {
    on: act("selectionModeEvents.on"),
    off: act("selectionModeEvents.off"),
    once: act("selectionModeEvents.once")
  },
  cameraEvents: {
    on: act("cameraEvents.on"),
    off: act("cameraEvents.off"),
    once: act("cameraEvents.once")
  },
  timelineEvents: {
    on: act("timelineEvents.on"),
    off: act("timelineEvents.off"),
    once: act("timelineEvents.once")
  },
  layersEvents: {
    on: act("layersEvents.on"),
    off: act("layersEvents.off"),
    once: act("layersEvents.once")
  },
  sketchEvents: {
    on: act("sketchEvents.on"),
    off: act("sketchEvents.off"),
    once: act("sketchEvents.once")
  }
};

function act<T extends any[], M extends (...args: T) => any>(
  name: string,
  mock?: M
): (...args: T) => ReturnType<M> {
  const a = action(`Common API: ${name}`);
  return (...args) => {
    a(...args);
    return mock?.(...args);
  };
}
