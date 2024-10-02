import { AppearanceNode } from "../types";

import { DEFAULT_SELECTED_FEATURE_COLOR, SHADOWS } from "./constant";

export const threedtilesNodes: AppearanceNode[] = [
  {
    id: "show",
    title: "Show",
    field: "switch",
    defaultValue: true
  },
  {
    id: "color",
    title: "Color",
    field: "color",
    defaultValue: "#ffffff"
  },
  {
    id: "styleUrl",
    title: "Style Url",
    field: "text",
    defaultValue: ""
  },
  {
    id: "shadows",
    title: "Shadows",
    field: "select",
    defaultValue: "disabled",
    valueOptions: SHADOWS
  },
  {
    id: "colorBlendMode",
    title: "Color Blend Mode",
    field: "select",
    defaultValue: "replace",
    valueOptions: ["highlight", "replace", "mix", "multiply"]
  },
  {
    id: "edgeWidth",
    title: "Edge Width",
    field: "number",
    defaultValue: 1
  },
  {
    id: "edgeColor",
    title: "Edge Color",
    field: "color",
    defaultValue: "#ffffff"
  },
  {
    id: "selectedFeatureColor",
    title: "Selected Feature Color",
    field: "color",
    defaultValue: DEFAULT_SELECTED_FEATURE_COLOR
  }
];
