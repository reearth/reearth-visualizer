import { AppearanceNode } from "../types";

import { DEFAULT_SELECTED_FEATURE_COLOR, HEIGHT_REFERENCES } from "./constant";

export const markerNodes: AppearanceNode[] = [
  {
    id: "show",
    title: "Show",
    field: "switch",
    defaultValue: true
  },
  {
    id: "height",
    title: "Height",
    field: "number",
    defaultValue: 0
  },
  {
    id: "heightReference",
    title: "Height Reference",
    field: "select",
    defaultValue: "clamp",
    valueOptions: HEIGHT_REFERENCES
  },
  {
    id: "style",
    title: "Style",
    field: "select",
    defaultValue: "image",
    valueOptions: ["none", "point", "image"]
  },
  {
    id: "pointSize",
    title: "Point Size",
    field: "number",
    defaultValue: 10
  },
  {
    id: "pointColor",
    title: "Point Color",
    field: "color",
    defaultValue: "#ffffff"
  },
  {
    id: "pointOutlineColor",
    title: "Point Outline Color",
    field: "color",
    defaultValue: "#ff0000"
  },
  {
    id: "pointOutlineWidth",
    title: "Point Outline Width",
    field: "number",
    defaultValue: 2
  },
  {
    id: "image",
    title: "Image",
    field: "text",
    defaultValue: ""
  },
  {
    id: "imageSize",
    title: "Image Size",
    field: "number",
    defaultValue: 100
  },
  {
    id: "imageSizeMeters",
    title: "Image Size Meters",
    field: "number",
    defaultValue: 10
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
