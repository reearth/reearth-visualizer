import { Cartesian3 } from "cesium";
import { createContext, useContext as useReactContext } from "react";

import { LayerEditEvent } from "@reearth/beta/lib/core/Map";

import type { Camera, LayerSelectionReason } from "../..";
import { TimelineManagerRef } from "../../../Map/useTimelineManager";
import type { FlyTo } from "../../../types";

export type Context = {
  selectionReason?: LayerSelectionReason;
  timelineManagerRef?: TimelineManagerRef;
  getCamera?: () => Camera | undefined;
  flyTo?: FlyTo;
  onLayerEdit?: (e: LayerEditEvent) => void;
  requestRender?: () => void;
  getSurfaceDistance?: (point1: Cartesian3, point2: Cartesian3) => number | undefined;
};

export const context = createContext<Context>({});

export const useContext = () => useReactContext(context);
