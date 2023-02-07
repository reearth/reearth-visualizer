import { createContext, useContext as useReactContext } from "react";

import { LayerEditEvent } from "@reearth/core/Map";

import type { Camera, FlyToDestination, CameraOptions, LayerSelectionReason } from "../..";

export type Context = {
  selectionReason?: LayerSelectionReason;
  getCamera?: () => Camera | undefined;
  flyTo?: (target: string | FlyToDestination, options?: CameraOptions) => void;
  onLayerEdit?: (e: LayerEditEvent) => void;
};

export const context = createContext<Context>({});

export const useContext = () => useReactContext(context);
