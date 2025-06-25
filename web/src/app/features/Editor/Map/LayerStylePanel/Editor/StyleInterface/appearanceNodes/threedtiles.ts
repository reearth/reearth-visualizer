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
    defaultValue: "highlight",
    valueOptions: ["highlight", "replace", "mix"]
  },
  {
    id: "selectedFeatureColor",
    title: "Selected Feature Color",
    field: "color",
    defaultValue: DEFAULT_SELECTED_FEATURE_COLOR,
    disableExpression: true,
    disableConditions: true
  },
  {
    id: "tileset",
    title: "Tileset",
    field: "text",
    defaultValue: ""
  },
  {
    id: "pbr",
    title: "Pbr",
    field: "switch",
    defaultValue: true
  },
  {
    id: "showWireframe",
    title: "Show Wire Frame",
    field: "switch",
    defaultValue: false
  },
  {
    id: "showBoundingVolume",
    title: "Show Bounding Volume",
    field: "switch",
    defaultValue: false
  }
];
