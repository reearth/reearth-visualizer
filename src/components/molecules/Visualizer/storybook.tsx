import { action } from "@storybook/addon-actions";
import React from "react";
import type { PropsWithChildren } from "react";

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

export function Provider({ children }: PropsWithChildren<{}>) {
  return <PluginProvider {...context}>{children}</PluginProvider>;
}

export const context: ProviderProps = {
  engineName: "cesium",
  engine: {},
  hideLayer: act("layers.hide"),
  showLayer: act("layers.show"),
  selectLayer: act("layers.select"),
  camera: {
    lat: 0,
    lng: 0,
    height: 0,
    heading: 0,
    pitch: 0,
    roll: 0,
    fov: Math.PI * (60 / 180),
  },
  layers: new LayerStore({ id: "", children: layers }),
  flyTo: act("flyTo"),
  lookAt: act("lookAt"),
  zoomIn: act("zoomIn"),
  zoomOut: act("zoomOut"),
  overrideLayerProperty: act("overrideLayerProperty"),
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
