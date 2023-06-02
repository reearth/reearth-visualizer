import { ReactNode, useMemo } from "react";

import LeftPanelScene from "@reearth/beta/features/LeftPanelScene";
import LeftPanelStory from "@reearth/beta/features/LeftPanelStory";
import { Tab } from "@reearth/beta/features/Navbar";

type Props = {
  tab: Tab;
};

export default ({ tab }: Props) => {
  const leftPanel = useMemo<ReactNode | undefined>(() => {
    // need to wrap with page component
    switch (tab as Tab | string) {
      case "scene":
        return <LeftPanelScene />;
      case "story":
        return <LeftPanelStory />;
      case "widgets":
      case "publish":
      default:
        return undefined;
    }
  }, [tab]);

  return {
    leftPanel,
  };
};
