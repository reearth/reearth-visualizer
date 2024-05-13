import { ReactNode, SetStateAction, useMemo } from "react";

import type { Tab } from "@reearth/beta/features/Navbar";
import type { Camera } from "@reearth/beta/utils/value";
import type { FlyTo } from "@reearth/core";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";
import { Item } from "@reearth/services/api/propertyApi/utils";
import type { Scene } from "@reearth/services/api/sceneApi";
import type { Page } from "@reearth/services/api/storytellingApi/utils";
import { WidgetAreaState } from "@reearth/services/state";

import { SelectedWidget } from "./hooks";
import MapSidePanel from "./tabs/map/RightPanel";
import StorySidePanel from "./tabs/story/RightPanel";
import WidgetSidePanel from "./tabs/widgets/RightPanel";
import { LayerConfigUpdateProps, SelectedLayer } from "./useLayers";
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
  selectedLayerId: SelectedLayer | undefined;
  selectedWidget: SelectedWidget | undefined;
  selectedWidgetArea: WidgetAreaState | undefined;
  onFlyTo?: FlyTo;
  onLayerStyleValueUpdate?: (inp: LayerStyleValueUpdateProps) => void;
  onLayerConfigUpdate?: (inp: LayerConfigUpdateProps) => void;
  onPageUpdate?: (id: string, layers: string[]) => void;
  onGeoJsonFeatureUpdate?: (inp: GeoJsonFeatureUpdateProps) => void;
  setSelectedWidget: (value: SelectedWidget | undefined) => void;
  setSelectedWidgetArea: (update?: SetStateAction<WidgetAreaState | undefined>) => void;
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
  selectedLayerId,
  selectedWidget,
  selectedWidgetArea,
  onPageUpdate,
  onFlyTo,
  onLayerStyleValueUpdate,
  onLayerConfigUpdate,
  onGeoJsonFeatureUpdate,
  setSelectedWidget,
  setSelectedWidgetArea,
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
            selectedLayerId={selectedLayerId}
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
          <WidgetSidePanel
            sceneId={sceneId}
            currentCamera={currentCamera}
            selectedWidget={selectedWidget}
            selectedWidgetArea={selectedWidgetArea}
            onFlyTo={onFlyTo}
            setSelectedWidget={setSelectedWidget}
            setSelectedWidgetArea={setSelectedWidgetArea}
          />
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
    selectedLayerId,
    selectedWidget,
    selectedWidgetArea,
    onFlyTo,
    onLayerStyleValueUpdate,
    onLayerConfigUpdate,
    onGeoJsonFeatureUpdate,
    currentPage,
    onPageUpdate,
    setSelectedWidget,
    setSelectedWidgetArea,
  ]);

  return {
    rightPanel,
  };
};
