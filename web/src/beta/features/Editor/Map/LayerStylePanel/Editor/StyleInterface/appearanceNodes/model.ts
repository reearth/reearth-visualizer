import { AppearanceNode } from "../types";

import { HEIGHT_REFERENCES, SHADOWS } from "./constant";

export const modelNodes: AppearanceNode[] = [
  {
    id: "show",
    title: "Show",
    field: "switch",
    defaultValue: true
  },
  {
    id: "url",
    title: "Url",
    field: "model",
    defaultValue: ""
  },
  {
    id: "heightReference",
    title: "Height Reference",
    field: "select",
    defaultValue: "clamp",
    valueOptions: HEIGHT_REFERENCES
  },
  {
    id: "height",
    title: "Height",
    field: "number",
    defaultValue: 0
  },
  {
    id: "heading",
    title: "Heading",
    field: "number",
    defaultValue: 0
  },
  {
    id: "pitch",
    title: "Pitch",
    field: "number",
    defaultValue: 0
  },
  {
    id: "roll",
    title: "Roll",
    field: "number",
    defaultValue: 0
  },
  {
    id: "scale",
    title: "Scale",
    field: "number",
    defaultValue: 1
  },
  {
    id: "maximumScale",
    title: "Maximum Scale",
    field: "number",
    defaultValue: 10
  },
  {
    id: "minimumPixelSize",
    title: "Minimum Pixel Size",
    field: "number",
    defaultValue: 100
  },
  {
    id: "animation",
    title: "Animation",
    field: "switch",
    defaultValue: false
  },
  {
    id: "shadows",
    title: "Shadows",
    field: "select",
    defaultValue: "disabled",
    valueOptions: SHADOWS
  },
  {
    id: "colorBlend",
    title: "Color Blend",
    field: "select",
    defaultValue: "none",
    valueOptions: ["none", "highlight", "replace", "mix"]
  },
  {
    id: "color",
    title: "Color",
    field: "color",
    defaultValue: "#ffffff"
  },
  {
    id: "colorBlendAmount",
    title: "Color Blend Amount",
    field: "number",
    defaultValue: 0.5
  },
  {
    id: "lightColor",
    title: "Light Color",
    field: "color",
    defaultValue: "#ffffff"
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
    id: "pbr",
    title: "Pbr",
    field: "switch",
    defaultValue: true
  }
];
