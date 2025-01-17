import { PluginType } from "../constants";

import { myPlugin } from "./custom/myPlugin";
import { addGeojson } from "./layers/add-geojson";
import { addCzml } from "./layers/add-czml";
import { addKml } from "./layers/add-kml";
import { addCsv } from "./layers/add-csv";
import { add3dTiles } from "./layers/add-3Dtiles";
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
    plugins: [addGeojson,addCzml,addKml,addCsv,add3dTiles]
    
  }
];
