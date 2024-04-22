import { createContext, useContext as useReactContext } from "react";

import { LayerEditEvent } from "@reearth/classic/core/Map";
import type { FlyTo } from "@reearth/core";

import type { Camera, LayerSelectionReason } from "../..";

export type Context = {
  selectionReason?: LayerSelectionReason;
  getCamera?: () => Camera | undefined;
  flyTo?: FlyTo;
  onLayerEdit?: (e: LayerEditEvent) => void;
};

export const context = createContext<Context>({});

export const useContext = () => useReactContext(context);
