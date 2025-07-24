import { IconName } from "@reearth/app/lib/reearth-ui";

import { AppearanceNodes, AppearanceType } from "../types";

import { markerNodes } from "./marker";
import { modelNodes } from "./model";
import { polygonNodes } from "./polygon";
import { polylineNodes } from "./polyline";
import { threedtilesNodes } from "./threedtiles";

export const appearanceNodes: AppearanceNodes = {
  marker: markerNodes,
  polyline: polylineNodes,
  polygon: polygonNodes,
  "3dtiles": threedtilesNodes,
  model: modelNodes
};

export const appearanceTypeIcons: Record<AppearanceType, IconName> = {
  marker: "points",
  polyline: "polyline",
  polygon: "polygon",
  "3dtiles": "buildings",
  model: "cube"
};

export const appearanceTypes: AppearanceType[] = [
  "marker",
  "polyline",
  "polygon",
  "3dtiles",
  "model"
];
