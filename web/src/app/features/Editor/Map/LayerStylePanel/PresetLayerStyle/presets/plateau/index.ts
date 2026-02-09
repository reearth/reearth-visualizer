import { PresetStyleCategory } from "../types";

import {
  plateauBuildingColorByHeight,
  plateauBuildingColorByUsage
} from "./building";
import { plateauHighTideRisk } from "./highTideRisk";
import { plateauInlandFloodingRisk } from "./inlandFloodingRisk";
import {
  plateauLandslideRiskDebrisFlow,
  plateauLandslideRiskLandslide,
  plateauLandslideRiskSteepSlopeFailure
} from "./landslideRisk";
import { plateauLanduse } from "./landuse";
import { plateauRiverFloodingRisk } from "./riverFloodingRisk";
import { plateauTsunamiRisk } from "./tsunamiRisk";

export const plateauPresets: PresetStyleCategory = {
  id: "plateauPresets",
  title: "Plateau Presets",
  testId: "preset-style-plateau-presets",
  subs: [
    plateauBuildingColorByHeight,
    plateauBuildingColorByUsage,
    plateauLanduse,
    plateauRiverFloodingRisk,
    plateauHighTideRisk,
    plateauTsunamiRisk,
    plateauInlandFloodingRisk,
    plateauLandslideRiskSteepSlopeFailure,
    plateauLandslideRiskDebrisFlow,
    plateauLandslideRiskLandslide
  ]
};
