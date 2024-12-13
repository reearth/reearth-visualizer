import { PluginType } from "../constants";

import { myPlugin } from "./custom/myPlugin";
import { responsivePanel } from "./ui/responsivePanel";
import { sidebar } from "./ui/sidebar";

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
    title: "UI",
    plugins: [responsivePanel, sidebar]
  }
];
