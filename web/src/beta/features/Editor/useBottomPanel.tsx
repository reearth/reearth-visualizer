import { ReactNode, useMemo } from "react";

import MapSidePanel from "@reearth/beta/features/Editor/tabs/map/BottomPanel";
import type { Tab } from "@reearth/beta/features/Navbar";
import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";

import { LayerStyleAddProps, LayerStyleNameUpdateProps } from "./useLayerStyles";

type Props = {
  tab: Tab;
  sceneId?: string;
  layerStyles: LayerStyle[];

  // layerStyles
  selectedLayerStyleId?: string;
  onLayerStyleAdd: (inp: LayerStyleAddProps) => void;
  onLayerStyleDelete: (id: string) => void;
  onLayerStyleNameUpdate: (inp: LayerStyleNameUpdateProps) => void;
  onLayerStyleSelect: (id: string) => void;
};

export default ({
  tab,
  layerStyles,
  selectedLayerStyleId,
  onLayerStyleAdd,
  onLayerStyleDelete,
  onLayerStyleNameUpdate,
  onLayerStyleSelect,
}: Props) => {
  const bottomPanel = useMemo<ReactNode | undefined>(() => {
    switch (tab) {
      case "map":
        return (
          <MapSidePanel
            layerStyles={layerStyles}
            onLayerStyleAdd={onLayerStyleAdd}
            onLayerStyleDelete={onLayerStyleDelete}
            onLayerStyleNameUpdate={onLayerStyleNameUpdate}
            onLayerStyleSelect={onLayerStyleSelect}
            selectedLayerStyleId={selectedLayerStyleId}
          />
        );
      case "story":
      case "widgets":
      case "publish":
      default:
        return undefined;
    }
  }, [
    tab,
    layerStyles,
    onLayerStyleAdd,
    onLayerStyleDelete,
    onLayerStyleNameUpdate,
    onLayerStyleSelect,
    selectedLayerStyleId,
  ]);

  return {
    bottomPanel,
  };
};
