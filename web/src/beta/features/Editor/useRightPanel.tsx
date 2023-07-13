import { ReactNode, useMemo } from "react";

import { Tab } from "@reearth/beta/features/Navbar";

import WidgetSidePanel from "./tabs/widgets/SidePanel";

type Props = {
  tab: Tab;
  sceneId?: string;
};

export default ({ tab, sceneId }: Props) => {
  const rightPanel = useMemo<ReactNode | undefined>(() => {
    switch (tab) {
      case "scene":
        return <div>TODO: right panel</div>;
      case "story":
        return <div>TODO: right panel</div>;
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
