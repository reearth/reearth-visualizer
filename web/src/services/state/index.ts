import { makeVar } from "@apollo/client";

import type { WidgetAreaType } from "@reearth/beta/lib/core/Crust";
import type { ComputedFeature, LayerSelectionReason } from "@reearth/beta/lib/core/Map";
import type { Camera } from "@reearth/beta/utils/value";

export type SelectedWidget = {
  id: string;
  pluginId: string;
  extensionId: string;
  propertyId: string;
};

export type SelectedLayer = {
  layerId: string;
  feature?: ComputedFeature;
  layerSelectionReason?: LayerSelectionReason;
};

// Visualizer
export const isVisualizerReadyVar = makeVar<boolean>(false);
export const currentCameraVar = makeVar<Camera | undefined>(undefined);

// Selected
export const selectedWidgetVar = makeVar<SelectedWidget | undefined>(undefined);
export const selectedWidgetAreaVar = makeVar<WidgetAreaType | undefined>(undefined);
export const selectedLayerVar = makeVar<SelectedLayer | undefined>(undefined);

export * from "./jotai";
