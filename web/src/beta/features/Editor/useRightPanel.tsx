import { ReactNode, useMemo } from "react";

import { Tab } from "@reearth/beta/features/Navbar";
import RightPanelScene from "@reearth/beta/features/RightPanelScene";
import RightPanelStory from "@reearth/beta/features/RightPanelStory";
import RightPanelWidgets from "@reearth/beta/features/RightPanelWidgets";

type Props = {
  tab: Tab;
};

export default ({ tab }: Props) => {
  const rightPanel = useMemo<ReactNode | undefined>(() => {
    switch (tab as Tab | string) {
      case "scene":
        return <RightPanelScene />;
      case "story":
        return <RightPanelStory />;
      case "widgets":
        return <RightPanelWidgets />;
      case "publish":
      default:
        return undefined;
    }
  }, [tab]);

  return {
    rightPanel,
  };
};
