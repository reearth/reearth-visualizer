import { PresetStyleCategory } from "../types";

import { plateauBuildingColorByHeight } from "./buildingColorByHeight";
import { plateauBuildingColorByUsage } from "./buildingColorByUsage";
import { plateauRoad } from "./road";

export const plateauPresets: PresetStyleCategory = {
  id: "plateauPresets",
  title: "Plateau Presets",
  testId: "preset-style-plateau-presets",
  subs: [plateauBuildingColorByHeight, plateauBuildingColorByUsage, plateauRoad]
};
