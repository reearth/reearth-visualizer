import { ReactNode, useMemo } from "react";

import type { Tab } from "@reearth/beta/features/Navbar";
import type { GQLStoryPage } from "@reearth/beta/lib/core/StoryPanel/hooks";
import type { FlyTo } from "@reearth/beta/lib/core/types";
import type { Camera } from "@reearth/beta/utils/value";

import MapSidePanel from "./tabs/map/RightPanel";
import StorySidePanel from "./tabs/story/RightPanel";
import WidgetSidePanel from "./tabs/widgets/RightPanel";

type Props = {
  tab: Tab;
  sceneId?: string;
  currentPage?: GQLStoryPage;
  showSceneSettings?: boolean;
  currentCamera?: Camera;
  onFlyTo?: FlyTo;
};

export default ({
  tab,
  sceneId,
  currentPage,
  showSceneSettings,
  currentCamera,
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
            onFlyTo={onFlyTo}
          />
        );
      case "widgets":
        return <WidgetSidePanel sceneId={sceneId} />;

      case "publish":
      default:
        return undefined;
    }
  }, [tab, sceneId, currentPage, showSceneSettings, currentCamera, onFlyTo]);

  return {
    rightPanel,
  };
};
