import { ReactNode, useMemo } from "react";

import type { Tab } from "@reearth/beta/features/Navbar";
import type { FlyTo } from "@reearth/beta/lib/core/types";
import type { Camera } from "@reearth/beta/utils/value";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import type { Page } from "@reearth/services/api/storytellingApi/utils";

import MapSidePanel from "./tabs/map/RightPanel";
import StorySidePanel from "./tabs/story/RightPanel";
import WidgetSidePanel from "./tabs/widgets/RightPanel";

type Props = {
  tab: Tab;
  sceneId?: string;
  nlsLayers: NLSLayer[];
  currentPage?: Page;
  showSceneSettings?: boolean;
  currentCamera?: Camera;
  onFlyTo?: FlyTo;
  onPageUpdate?: (id: string, layers: string[]) => void;
};

export default ({
  tab,
  sceneId,
  nlsLayers,
  currentPage,
  showSceneSettings,
  currentCamera,
  onPageUpdate,
  onFlyTo,
}: Props) => {
  const rightPanel = useMemo<ReactNode | undefined>(() => {
    switch (tab) {
      case "map":
        return (
          <MapSidePanel
            sceneId={sceneId}
            showSceneSettings={showSceneSettings}
            currentCamera={currentCamera}
            onFlyTo={onFlyTo}
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
    sceneId,
    showSceneSettings,
    currentCamera,
    currentPage,
    nlsLayers,
    onFlyTo,
    onPageUpdate,
  ]);

  return {
    rightPanel,
  };
};
