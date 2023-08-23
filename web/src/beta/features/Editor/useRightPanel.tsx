import { ReactNode, useMemo } from "react";

import { Tab } from "@reearth/beta/features/Navbar";

import MapSidePanel from "./tabs/map/RightPanel";
import StorySidePanel from "./tabs/story/RightPanel";
import WidgetSidePanel from "./tabs/widgets/RightPanel";

type Props = {
  tab: Tab;
  sceneId?: string;
};

export default ({ tab, sceneId }: Props) => {
  const rightPanel = useMemo<ReactNode | undefined>(() => {
    switch (tab) {
      case "map":
        return <MapSidePanel />;
      case "story":
        return <StorySidePanel />;
      case "widgets":
        return <WidgetSidePanel sceneId={sceneId} />;

      case "publish":
      default:
        return undefined;
    }
  }, [tab, sceneId]);

  return {
    rightPanel,
  };
};
