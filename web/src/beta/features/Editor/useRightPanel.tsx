import { ReactNode, useMemo } from "react";

import { Tab } from "@reearth/beta/features/Navbar";

import { StoryPageFragmentFragment } from "./StoryPanel/hooks";
import MapSidePanel from "./tabs/map/RightPanel";
import StorySidePanel from "./tabs/story/RightPanel";
import WidgetSidePanel from "./tabs/widgets/RightPanel";

type Props = {
  tab: Tab;
  sceneId?: string;
  currentPage?: StoryPageFragmentFragment;
};

export default ({ tab, sceneId, currentPage }: Props) => {
  const rightPanel = useMemo<ReactNode | undefined>(() => {
    switch (tab) {
      case "map":
        return <MapSidePanel />;
      case "story":
        return <StorySidePanel selectedPage={currentPage} />;
      case "widgets":
        return <WidgetSidePanel sceneId={sceneId} />;

      case "publish":
      default:
        return undefined;
    }
  }, [tab, sceneId, currentPage]);

  return {
    rightPanel,
  };
};
