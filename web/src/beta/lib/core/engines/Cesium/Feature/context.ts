import { Cartesian3 } from "cesium";
import { createContext, useContext as useReactContext } from "react";

import { LayerEditEvent, LayerLoadEvent, LayerVisibilityEvent } from "@reearth/beta/lib/core/Map";

import type { Camera, LayerSelectionReason } from "../..";
import { TimelineManagerRef } from "../../../Map/useTimelineManager";
import type { FlyTo } from "../../../types";

export type Context = {
  selectionReason?: LayerSelectionReason;
  timelineManagerRef?: TimelineManagerRef;
  getCamera?: () => Camera | undefined;
  flyTo?: FlyTo;
  onLayerEdit?: (e: LayerEditEvent) => void;
  onLayerVisibility?: (e: LayerVisibilityEvent) => void;
  onLayerLoad?: (e: LayerLoadEvent) => void;
  requestRender?: () => void;
  getSurfaceDistance?: (point1: Cartesian3, point2: Cartesian3) => number | undefined;
  toXYZ?: (
    lng: number,
    lat: number,
    height: number,
    options?: { useGlobeEllipsoid?: boolean },
  ) => [x: number, y: number, z: number] | undefined;
  toWindowPosition?: (
    position: [x: number, y: number, z: number],
  ) => [x: number, y: number] | undefined;
  isPositionVisible?: (position: [x: number, y: number, z: number]) => boolean;
};

export const context = createContext<Context>({});

export const useContext = () => useReactContext(context);
