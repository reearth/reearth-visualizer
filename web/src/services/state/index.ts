import { makeVar } from "@apollo/client";

import type { WidgetAreaType } from "@reearth/beta/lib/core/Crust";

export type SelectedWidget = {
  id: string;
  pluginId: string;
  extensionId: string;
  propertyId: string;
};

export const selectedWidgetVar = makeVar<SelectedWidget | undefined>(undefined);

export const selectedWidgetAreaVar = makeVar<WidgetAreaType | undefined>(undefined);

export * from "./jotai";
