import { createContext, useContext as useReactContext } from "react";

import { LayerEditEvent } from "@reearth/beta/lib/core/Map";

import type { Camera, LayerSelectionReason } from "../..";
import type { FlyTo } from "../../../types";

export type Context = {
  selectionReason?: LayerSelectionReason;
  getCamera?: () => Camera | undefined;
  flyTo?: FlyTo;
  onLayerEdit?: (e: LayerEditEvent) => void;
  requestRender?: () => void;
};

export const context = createContext<Context>({});

export const useContext = () => useReactContext(context);
