import { PresetStyleCategory } from "../types";

import { plateauArea } from "./area";
import { plateauBridge } from "./bridge";
import { plateauBuildingColorByHeight } from "./buildingColorByHeight";
import { plateauBuildingColorByUsage } from "./buildingColorByUsage";
import { plateauFloodingRisk } from "./floodingRisk";
import { plateauLandSlideRisk } from "./landSlideRisk";
import { plateauLanduse } from "./landuse";
import { plateauTraffic } from "./traffic";
import {
  plateauUrbanPlanningFirePrevention,
  plateauUrbanPlanningHeightControlDistrict,
  plateauUrbanPlanningUseDistrict
} from "./urbanPlanning";
import { plateauVegetation } from "./vegetation";

export const plateauPresets: PresetStyleCategory = {
  id: "plateauPresets",
  title: "Plateau Presets",
  testId: "preset-style-plateau-presets",
  subs: [
    plateauBuildingColorByHeight,
    plateauBuildingColorByUsage,
    plateauTraffic,
    plateauLanduse,
    plateauFloodingRisk,
    plateauLandSlideRisk,
    plateauUrbanPlanningFirePrevention,
    plateauUrbanPlanningHeightControlDistrict,
    plateauUrbanPlanningUseDistrict,
    plateauBridge,
    plateauVegetation,
    plateauArea
  ]
};
