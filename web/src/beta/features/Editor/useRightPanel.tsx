import { ReactNode, useMemo } from "react";

import type { Tab } from "@reearth/beta/features/Navbar";
import type { Camera } from "@reearth/beta/utils/value";
import type { FlyTo } from "@reearth/core";
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
import { GeoJsonFeatureUpdateProps } from "./useSketch";

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
  onGeoJsonFeatureUpdate?: (inp: GeoJsonFeatureUpdateProps) => void;
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
  onGeoJsonFeatureUpdate,
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
            onGeoJsonFeatureUpdate={onGeoJsonFeatureUpdate}
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
    tab,
    scene,
    layerStyles,
    nlsLayers,
    sceneId,
    sceneSettings,
    currentCamera,
    selectedLayerStyleId,
    selectedSceneSetting,
    onFlyTo,
    onLayerStyleValueUpdate,
    onLayerConfigUpdate,
    onGeoJsonFeatureUpdate,
    currentPage,
    onPageUpdate,
  ]);

  return {
    rightPanel,
  };
};
