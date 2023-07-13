import { ReactNode, useMemo } from "react";

import { Tab } from "@reearth/beta/features/Navbar";

import WidgetSidePanel from "./tabs/widgets/SidePanel";

type Props = {
  tab: Tab;
};

export default ({ tab }: Props) => {
  const rightPanel = useMemo<ReactNode | undefined>(() => {
    switch (tab) {
      case "scene":
        return <div>TODO: right panel</div>;
      case "story":
        return <div>TODO: right panel</div>;
      case "widgets":
        return <WidgetSidePanel />;

      case "publish":
      default:
        return undefined;
    }
  }, [tab]);

  return {
    rightPanel,
  };
};
