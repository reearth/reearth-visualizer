import { isEqual } from "lodash-es";
import { memo } from "react";

import { JapanGSIOptimalBVmapVectorMapLabel } from "./JapanGSIOptimalBVmapVectorMapLabel";

export interface TileLabelConfig {
  id: string;
  labelType: "japan_gsi_optimal_bvmap";
  fillColor?: string;
  outlineColor?: string;
  style: Record<string, any>;
}

interface JapanGSIOptimalBVmapLabelImageryLayersProps {
  tileLabels?: TileLabelConfig[];
}

const LabelImageryLayers = memo(
  ({ tileLabels = [] }: JapanGSIOptimalBVmapLabelImageryLayersProps) => {
    return (
      <>
        {tileLabels.map(label => {
          if (!label) return null;
          switch (label.labelType) {
            case "japan_gsi_optimal_bvmap":
              return <JapanGSIOptimalBVmapVectorMapLabel key={label.id} style={label.style} />;
            default:
              return null;
          }
        })}
      </>
    );
  },
  (prev, next) => isEqual(prev.tileLabels, next.tileLabels),
);

export default LabelImageryLayers;

LabelImageryLayers.displayName = "LabelImageryLayers";
