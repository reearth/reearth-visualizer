import { PluginType } from "../constants";

import { myPlugin } from "./custom/myPlugin";
import { addGeojson } from "./layers/add-geojson";
import { header } from "./ui/header";
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
    plugins: [responsivePanel, sidebar, header, uiExtensionMessenger]
  },
  {
    id: "layers",
    title: "Layers",
    plugins: [addGeojson]
  }
];
