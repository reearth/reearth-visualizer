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
    field: "text",
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
    id: "shadows",
    title: "Shadows",
    field: "select",
    defaultValue: "disabled",
    valueOptions: SHADOWS
  }
];
