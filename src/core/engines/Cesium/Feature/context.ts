import { createContext, useContext as useReactContext } from "react";

import { LayerEditEvent } from "@reearth/core/Map";

import type { Camera, FlyToDestination, CameraOptions } from "../..";

export type Context = {
  selectionReason?: string;
  getCamera?: () => Camera | undefined;
  flyTo?: (camera: FlyToDestination, options?: CameraOptions) => void;
  onLayerEdit?: (e: LayerEditEvent) => void;
};

export const context = createContext<Context>({});

export const useContext = () => useReactContext(context);
