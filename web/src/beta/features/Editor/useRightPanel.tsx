import { ReactNode, useMemo } from "react";

import type { Tab } from "@reearth/beta/features/Navbar";
import type { FlyTo } from "@reearth/beta/lib/core/types";
import type { Camera } from "@reearth/beta/utils/value";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";
import type { Page } from "@reearth/services/api/storytellingApi/utils";

import MapSidePanel from "./tabs/map/RightPanel";
import StorySidePanel from "./tabs/story/RightPanel";
import WidgetSidePanel from "./tabs/widgets/RightPanel";
import { LayerConfigUpdateProps } from "./useLayers";
import { LayerStyleValueUpdateProps } from "./useLayerStyles";

type Props = {
  layerStyles: LayerStyle[];
  tab: Tab;
  sceneId?: string;
  nlsLayers: NLSLayer[];
  currentPage?: Page;
  showSceneSettings?: boolean;
  currentCamera?: Camera;
  selectedLayerStyleId?: string;
  onFlyTo?: FlyTo;
  onLayerStyleValueUpdate?: (inp: LayerStyleValueUpdateProps) => void;
  onLayerConfigUpdate?: (inp: LayerConfigUpdateProps) => void;
  onPageUpdate?: (id: string, layers: string[]) => void;
  onTimeChange?: (t: Date) => void;
};

export default ({
  layerStyles,
  tab,
  sceneId,
  nlsLayers,
  currentPage,
  showSceneSettings,
  selectedLayerStyleId,
  currentCamera,
  onPageUpdate,
  onFlyTo,
  onLayerStyleValueUpdate,
  onLayerConfigUpdate,
  onTimeChange,
}: Props) => {
  const rightPanel = useMemo<ReactNode | undefined>(() => {
    switch (tab) {
      case "map":
        return (
          <MapSidePanel
            layerStyles={layerStyles}
            layers={nlsLayers}
            sceneId={sceneId}
            showSceneSettings={showSceneSettings}
            currentCamera={currentCamera}
            selectedLayerStyleId={selectedLayerStyleId}
            onFlyTo={onFlyTo}
            onLayerStyleValueUpdate={onLayerStyleValueUpdate}
            onLayerConfigUpdate={onLayerConfigUpdate}
          />
        );
      case "story":
        return (
          <StorySidePanel
            selectedPage={currentPage}
            currentCamera={currentCamera}
            layers={nlsLayers}
            tab={tab}
            onFlyTo={onFlyTo}
            onPageUpdate={onPageUpdate}
            onTimeChange={onTimeChange}
          />
        );
      case "widgets":
        return <WidgetSidePanel sceneId={sceneId} />;

      case "publish":
      default:
        return undefined;
    }
  }, [
    tab,
    layerStyles,
    nlsLayers,
    sceneId,
    showSceneSettings,
    currentCamera,
    selectedLayerStyleId,
    onFlyTo,
    onLayerStyleValueUpdate,
    onLayerConfigUpdate,
    currentPage,
    onPageUpdate,
    onTimeChange,
  ]);

  return {
    rightPanel,
  };
};
