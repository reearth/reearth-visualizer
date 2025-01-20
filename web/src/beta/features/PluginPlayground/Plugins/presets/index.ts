import { PluginType } from "../constants";

import { myPlugin } from "./custom/myPlugin";
import { addGeojson } from "./layers/add-geojson";
import { header } from "./ui/header";
import { hideFlyToDeleteLayer } from "./ui/hideFlyToDeleteLayer";
import { responsivePanel } from "./ui/responsivePanel";
import { sidebar } from "./ui/sidebar";
import { uiExtensionMessenger } from "./ui/uiExtensionMessenger";

type PresetPluginCategory = {
  id: string;
  title: string;
  plugins: PluginType[];
};

export type PresetPlugins = PresetPluginCategory[];

export const presetPlugins: PresetPlugins = [
  {
    id: "custom",
    title: "Custom",
    plugins: [myPlugin]
  },
  {
    id: "ui",
    title: "User Interface",
    plugins: [responsivePanel, sidebar, header]
  },
  {
    id: "communication",
    title: "Communication",
    plugins: [uiExtensionMessenger]
  },
  {
    id: "viewerScene",
    title: "Viewer & Scene Settings",
    plugins: []
  },
  {
    id: "layers",
    title: "Manage Layer",
    plugins: [addGeojson, hideFlyToDeleteLayer]
  },
  {
    id: "layerStyles",
    title: "Manage Layer Style",
    plugins: []
  },

  {
    id: "camera",
    title: "Camera",
    plugins: []
  },
  {
    id: "timeline",
    title: "Timeline",
    plugins: []
  },
  {
    id: "dataStorage",
    title: "Data Storage",
    plugins: []
  },
  {
    id: "sketch",
    title: "Sketch",
    plugins: []
  }
];
