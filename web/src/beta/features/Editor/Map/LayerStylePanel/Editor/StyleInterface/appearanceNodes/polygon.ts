import { AppearanceNode } from "../types";

import { DEFAULT_SELECTED_FEATURE_COLOR } from "./constant";

export const polygonNodes: AppearanceNode[] = [
  {
    id: "show",
    title: "Show",
    field: "switch",
    defaultValue: true
  },
  {
    id: "fill",
    title: "Fill",
    field: "switch",
    defaultValue: true
  },
  {
    id: "fillColor",
    title: "Fill Color",
    field: "color",
    defaultValue: "#ffffff"
  },
  {
    id: "stroke",
    title: "Stroke",
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
    id: "heightReference",
    title: "Height Reference",
    field: "select",
    defaultValue: "clamp",
    valueOptions: ["none", "clamp", "relative"]
  },
  {
    id: "extrudedHeight",
    title: "Extruded Height",
    field: "number",
    defaultValue: 0
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
