import { ReactNode, useMemo } from "react";

import type { Tab } from "@reearth/beta/features/Navbar";
import type { FlyTo } from "@reearth/beta/lib/core/types";
import type { Camera } from "@reearth/beta/utils/value";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";
import { Item } from "@reearth/services/api/propertyApi/utils";
import type { Scene } from "@reearth/services/api/sceneApi";
import type { Page } from "@reearth/services/api/storytellingApi/utils";

import MapSidePanel from "./tabs/map/RightPanel";
import StorySidePanel from "./tabs/story/RightPanel";
import WidgetSidePanel from "./tabs/widgets/RightPanel";
import { LayerConfigUpdateProps } from "./useLayers";
import { LayerStyleValueUpdateProps } from "./useLayerStyles";

type Props = {
  layerStyles: LayerStyle[];
  scene?: Scene;
  sceneSettings?: Item[];
  tab: Tab;
  sceneId?: string;
  nlsLayers: NLSLayer[];
  currentPage?: Page;
  currentCamera?: Camera;
  selectedLayerStyleId?: string;
  selectedSceneSetting?: string;
  onFlyTo?: FlyTo;
  onLayerStyleValueUpdate?: (inp: LayerStyleValueUpdateProps) => void;
  onLayerConfigUpdate?: (inp: LayerConfigUpdateProps) => void;
  onPageUpdate?: (id: string, layers: string[]) => void;
};

export default ({
  scene,
  layerStyles,
  tab,
  sceneId,
  nlsLayers,
  currentPage,
  selectedLayerStyleId,
  selectedSceneSetting,
  sceneSettings,
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
            scene={scene}
            layerStyles={layerStyles}
            layers={nlsLayers}
            sceneId={sceneId}
            sceneSettings={sceneSettings}
            currentCamera={currentCamera}
            selectedLayerStyleId={selectedLayerStyleId}
            selectedSceneSetting={selectedSceneSetting}
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
        return (
          <WidgetSidePanel sceneId={sceneId} currentCamera={currentCamera} onFlyTo={onFlyTo} />
        );

      case "publish":
      default:
        return undefined;
    }
  }, [
    scene,
    tab,
    layerStyles,
    nlsLayers,
    sceneId,
    currentCamera,
    selectedLayerStyleId,
    selectedSceneSetting,
    sceneSettings,
    currentPage,
    onFlyTo,
    onLayerStyleValueUpdate,
    onLayerConfigUpdate,
    onPageUpdate,
  ]);

  return {
    rightPanel,
  };
};
