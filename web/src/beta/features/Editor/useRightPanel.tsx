import { ReactNode, useMemo } from "react";

import type { Tab } from "@reearth/beta/features/Navbar";
import type { FlyTo } from "@reearth/beta/lib/core/types";
import type { Camera } from "@reearth/beta/utils/value";
import { NLSAppearance } from "@reearth/services/api/appearanceApi/utils";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import type { Page } from "@reearth/services/api/storytellingApi/utils";

import MapSidePanel from "./tabs/map/RightPanel";
import StorySidePanel from "./tabs/story/RightPanel";
import WidgetSidePanel from "./tabs/widgets/RightPanel";
import { AppearanceValueUpdateProps } from "./useAppearances";
import { LayerConfigUpdateProps } from "./useLayers";

type Props = {
  appearances: NLSAppearance[];
  tab: Tab;
  sceneId?: string;
  nlsLayers: NLSLayer[];
  currentPage?: Page;
  showSceneSettings?: boolean;
  currentCamera?: Camera;
  selectedLayerId?: string;
  selectedAppearanceId?: string;
  onFlyTo?: FlyTo;
  onAppearanceValueUpdate?: (inp: AppearanceValueUpdateProps) => void;
  onLayerConfigUpdate?: (inp: LayerConfigUpdateProps) => void;
};

export default ({
  appearances,
  tab,
  sceneId,
  nlsLayers,
  currentPage,
  showSceneSettings,
  selectedAppearanceId,
  selectedLayerId,
  currentCamera,
  onFlyTo,
  onAppearanceValueUpdate,
  onLayerConfigUpdate,
}: Props) => {
  const rightPanel = useMemo<ReactNode | undefined>(() => {
    switch (tab) {
      case "map":
        return (
          <MapSidePanel
            appearances={appearances}
            layers={nlsLayers}
            sceneId={sceneId}
            showSceneSettings={showSceneSettings}
            currentCamera={currentCamera}
            selectedAppearanceId={selectedAppearanceId}
            selectedLayerId={selectedLayerId}
            onFlyTo={onFlyTo}
            onAppearanceValueUpdate={onAppearanceValueUpdate}
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
    appearances,
    sceneId,
    showSceneSettings,
    currentCamera,
    selectedAppearanceId,
    selectedLayerId,
    currentPage,
    nlsLayers,
    onFlyTo,
    onAppearanceValueUpdate,
    onLayerConfigUpdate,
  ]);

  return {
    rightPanel,
  };
};
