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
  selectedLayerId?: string;
  selectedLayerStyleId?: string;
  onFlyTo?: FlyTo;
  onLayerStyleValueUpdate?: (inp: LayerStyleValueUpdateProps) => void;
  onLayerConfigUpdate?: (inp: LayerConfigUpdateProps) => void;
  onPageUpdate?: (id: string, layers: string[]) => void;
};

export default ({
  layerStyles,
  tab,
  sceneId,
  nlsLayers,
  currentPage,
  showSceneSettings,
  selectedLayerStyleId,
  selectedLayerId,
  currentCamera,
  onPageUpdate,
  onFlyTo,
  onLayerStyleValueUpdate,
  onLayerConfigUpdate,
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
            selectedLayerId={selectedLayerId}
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
    sceneId,
    showSceneSettings,
    currentCamera,
    selectedLayerStyleId,
    selectedLayerId,
    currentPage,
    nlsLayers,
    onFlyTo,
    onLayerStyleValueUpdate,
    onLayerConfigUpdate,
    onPageUpdate,
  ]);

  return {
    rightPanel,
  };
};
