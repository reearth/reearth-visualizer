import { makeVar } from "@apollo/client";

import type { WidgetAreaType } from "@reearth/beta/lib/core/Crust";
import { LayerSelectionReason } from "@reearth/beta/lib/core/Map";

export type SelectedWidget = {
  id: string;
  pluginId: string;
  extensionId: string;
  propertyId: string;
};

export type SelectedLayer = {
  id: string;
  layerId: string;
  featureId?: string;
  layerSelectionReason?: LayerSelectionReason;
};

export const selectedWidgetVar = makeVar<SelectedWidget | undefined>(undefined);

export const selectedWidgetAreaVar = makeVar<WidgetAreaType | undefined>(undefined);

export const selectedLayerVar = makeVar<SelectedLayer | undefined>(undefined);

export * from "./jotai";
