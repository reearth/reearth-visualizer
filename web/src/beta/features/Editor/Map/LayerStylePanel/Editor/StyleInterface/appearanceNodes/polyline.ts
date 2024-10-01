import { AppearanceNode } from "../types";

import { DEFAULT_SELECTED_FEATURE_COLOR } from "./constant";

export const polylineNodes: AppearanceNode[] = [
  {
    id: "show",
    title: "Show",
    field: "switch",
    defaultValue: true
  },
  {
    id: "clampToGround",
    title: "Clamp To Ground",
    field: "switch",
    defaultValue: true
  },
  {
    id: "strokeColor",
    title: "Stroke Color",
    field: "color",
    defaultValue: "#ffffff"
  },
  {
    id: "strokeWidth",
    title: "Stroke Width",
    field: "number",
    defaultValue: 2
  },
  {
    id: "hideIndicator",
    title: "Hide Indicator",
    field: "switch",
    defaultValue: false
  },
  {
    id: "selectedFeatureColor",
    title: "Selected Feature Color",
    field: "color",
    defaultValue: DEFAULT_SELECTED_FEATURE_COLOR
  }
];
