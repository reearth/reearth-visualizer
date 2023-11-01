import { ReactNode, useMemo } from "react";

import type { Tab } from "@reearth/beta/features/Navbar";
import type { FlyTo } from "@reearth/beta/lib/core/types";
import type { Camera } from "@reearth/beta/utils/value";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";
import type { Page } from "@reearth/services/api/storytellingApi/utils";
import { Scene } from "@reearth/services/gql";

import MapSidePanel from "./tabs/map/RightPanel";
import StorySidePanel from "./tabs/story/RightPanel";
import WidgetSidePanel from "./tabs/widgets/RightPanel";
import { LayerConfigUpdateProps } from "./useLayers";
import { LayerStyleValueUpdateProps } from "./useLayerStyles";

type Props = {
  layerStyles: LayerStyle[];
  scene?: Scene;
  tab: Tab;
  sceneId?: string;
  nlsLayers: NLSLayer[];
  currentPage?: Page;
  showSceneSettings?: boolean;
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
  showSceneSettings,
  selectedLayerStyleId,
  selectedSceneSetting,
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
            showSceneSettings={showSceneSettings}
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
        return <WidgetSidePanel sceneId={sceneId} />;

      case "publish":
      default:
        return undefined;
    }
  }, [
    scene,
    tab,
    layerStyles,
    sceneId,
    showSceneSettings,
    currentCamera,
    selectedLayerStyleId,
    selectedSceneSetting,
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
