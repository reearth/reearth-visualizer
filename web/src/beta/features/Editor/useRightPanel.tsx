import { ReactNode, useMemo } from "react";

import { Tab } from "@reearth/beta/features/Navbar";
import type { GQLStoryPage } from "@reearth/beta/lib/core/StoryPanel/hooks";

import MapSidePanel from "./tabs/map/RightPanel";
import StorySidePanel from "./tabs/story/RightPanel";
import WidgetSidePanel from "./tabs/widgets/RightPanel";

type Props = {
  tab: Tab;
  sceneId?: string;
  currentPage?: GQLStoryPage;
  showSceneSettings?: boolean;
};

export default ({ tab, sceneId, currentPage, showSceneSettings }: Props) => {
  const rightPanel = useMemo<ReactNode | undefined>(() => {
    switch (tab) {
      case "map":
        return <MapSidePanel sceneId={sceneId} showSceneSettings={showSceneSettings} />;
      case "story":
        return <StorySidePanel selectedPage={currentPage} />;
      case "widgets":
        return <WidgetSidePanel sceneId={sceneId} />;

      case "publish":
      default:
        return undefined;
    }
  }, [tab, sceneId, currentPage, showSceneSettings]);

  return {
    rightPanel,
  };
};
