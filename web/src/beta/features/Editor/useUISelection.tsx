import { useCallback } from "react";

import { LayerSelectProps } from "./useLayers";

// TODO: Refactor to unite selection handlers
export const useUISelection = ({
  handleLayerSelect,
  handleLayerStyleSelect,
  handleSceneSettingSelect,
}: {
  handleLayerSelect: (props: LayerSelectProps) => void;
  handleLayerStyleSelect: (layerStyleId?: string) => void;
  handleSceneSettingSelect: (collection?: string) => void;
}) => {
  const handleLayerStyleSelected = useCallback(
    (layerStyleId: string) => {
      handleLayerSelect(undefined);
      handleSceneSettingSelect(undefined);
      handleLayerStyleSelect(layerStyleId);
    },
    [handleLayerStyleSelect, handleSceneSettingSelect, handleLayerSelect],
  );

  const handleLayerSelected = useCallback(
    (layerId: string) => {
      handleLayerStyleSelect(undefined);
      handleSceneSettingSelect(undefined);
      handleLayerSelect({ layerId });
    },
    [handleLayerSelect, handleSceneSettingSelect, handleLayerStyleSelect],
  );

  const handleSceneSettingSelected = useCallback(
    (collection?: string) => {
      handleLayerStyleSelect(undefined);
      handleLayerSelect(undefined);
      handleSceneSettingSelect(collection);
    },
    [handleLayerSelect, handleSceneSettingSelect, handleLayerStyleSelect],
  );

  return {
    handleLayerStyleSelected,
    handleLayerSelected,
    handleSceneSettingSelected,
  };
};
