import { AppearanceNode } from "../types";

import {
  CLASSIFICATION_TYPE,
  DEFAULT_SELECTED_FEATURE_COLOR,
  HEIGHT_REFERENCES,
  SHADOWS
} from "./constant";

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
    valueOptions: HEIGHT_REFERENCES
  },
  {
    id: "shadows",
    title: "Shadows",
    field: "select",
    defaultValue: "disabled",
    valueOptions: SHADOWS
  },
  {
    id: "near",
    title: "Near",
    field: "number",
    defaultValue: 0
  },
  {
    id: "far",
    title: "Far",
    field: "number",
    defaultValue: 10000
  },
  {
    id: "classificationType",
    title: "Classification Type",
    field: "select",
    defaultValue: "both",
    valueOptions: CLASSIFICATION_TYPE
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
    defaultValue: DEFAULT_SELECTED_FEATURE_COLOR,
    disableExpression: true,
    disableConditions: true
  }
];
