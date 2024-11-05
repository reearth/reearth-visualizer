import { useCallback } from "react";

import { LayerSelectProps } from "./useLayers";

// TODO: Refactor to unite selection handlers
export const useUISelection = ({
  handleLayerSelect,
  handleLayerStyleSelect,
  handleSceneSettingSelect
}: {
  handleLayerSelect: (props: LayerSelectProps) => void;
  handleLayerStyleSelect: (layerStyleId?: string) => void;
  handleSceneSettingSelect: (collection?: string) => void;
}) => {
  const handleLayerStyleSelected = useCallback(
    (layerStyleId: string) => {
      handleLayerStyleSelect(layerStyleId);
    },
    [handleLayerStyleSelect]
  );

  const handleLayerSelected = useCallback(
    (layerId: string) => {
      handleSceneSettingSelect(undefined);
      handleLayerSelect({ layerId });
    },
    [handleLayerSelect, handleSceneSettingSelect]
  );

  const handleSceneSettingSelected = useCallback(
    (collection?: string) => {
      handleLayerSelect(undefined);
      handleSceneSettingSelect(collection);
    },
    [handleLayerSelect, handleSceneSettingSelect]
  );

  return {
    handleLayerStyleSelected,
    handleLayerSelected,
    handleSceneSettingSelected
  };
};
