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
    field: "image",
    defaultValue: ""
  },
  {
    id: "imageSize",
    title: "Image Size",
    field: "number",
    defaultValue: 1
  },
  {
    id: "imageSizeInMeters",
    title: "Image Size In Meters",
    field: "switch",
    defaultValue: false
  },

  {
    id: "imageHorizontalOrigin",
    title: "Image Horizontal Origin",
    field: "select",
    defaultValue: "center",
    valueOptions: ["left", "center", "right"]
  },
  {
    id: "imageVerticalOrigin",
    title: "Image Vertical Origin",
    field: "select",
    defaultValue: "center",
    valueOptions: ["top", "center", "baseline", "bottom"]
  },
  {
    id: "imageColor",
    title: "Image Color",
    field: "color",
    defaultValue: "#ffffff"
  },
  {
    id: "imageCrop",
    title: "Image Crop",
    field: "select",
    defaultValue: "none",
    valueOptions: ["none", "circle"]
  },
  {
    id: "imageShadow",
    title: "Image Shadow",
    field: "switch",
    defaultValue: false
  },
  {
    id: "imageShadowColor",
    title: "Image Shadow Color",
    field: "color",
    defaultValue: "#ffffff"
  },
  {
    id: "imageShadowBlur",
    title: "Image Shadow Blur",
    field: "number",
    defaultValue: 0
  },
  {
    id: "imageShadowPositionX",
    title: "Image Shadow PositionX",
    field: "number",
    defaultValue: 0
  },
  {
    id: "imageShadowPositionY",
    title: "Image Shadow PositionY",
    field: "number",
    defaultValue: 0
  },
  {
    id: "label",
    title: "Label",
    field: "switch",
    defaultValue: false
  },
  {
    id: "labelText",
    title: "Label Text",
    field: "text",
    defaultValue: "marker"
  },
  {
    id: "labelPosition",
    title: "Label Position",
    field: "select",
    defaultValue: "left",
    valueOptions: [
      "left",
      "right",
      "top",
      "bottom",
      "lefttop",
      "leftbottom",
      "righttop",
      "rightbottom"
    ]
  },
  {
    id: "labelTypography",
    title: "Label Typography",
    field: "typography",
    defaultValue: {
      fontFamily: "noto sans",
      fontSize: 14,
      fontWeight: "400",
      color: "#FFFFFF",
      italic: false
    },
    disableExpression: true,
    disableConditions: true
  },
  {
    id: "labelBackground",
    title: "Label Background ",
    field: "switch",
    defaultValue: false
  },
  {
    id: "labelBackgroundColor",
    title: "Label Background Color",
    field: "color",
    defaultValue: "#FFFFFF"
  },
  {
    id: "labelBackgroundPaddingHorizontal",
    title: "Label Background Padding Horizontal",
    field: "number",
    defaultValue: 0
  },
  {
    id: "labelBackgroundPaddingVertical",
    title: "Label Background Padding Vertical",
    field: "number",
    defaultValue: 0
  },
  {
    id: "extrude",
    title: "Extrude",
    field: "switch",
    defaultValue: false
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
