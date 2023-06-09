import { ReactNode, useMemo } from "react";

import SidePanel, { SidePanelContent } from "@reearth/beta/features/Editor/SidePanel";
import { Tab } from "@reearth/beta/features/Navbar";

type Props = {
  tab: Tab;
};

const getSceneContents = (): SidePanelContent[] => {
  return [
    {
      id: "Outline",
      title: "Outline",
      children: (
        <>
          {[...Array(100)].map((_, i) => (
            <div key={i}>scrollable / {i}</div>
          ))}
        </>
      ),
    },
  ];
};

const getStoryContents = (): SidePanelContent[] => {
  return [
    {
      id: "Inspector",
      title: "Inspector",
      children: (
        <>
          {[...Array(100)].map((_, i) => (
            <div key={i}>scrollable / {i}</div>
          ))}
        </>
      ),
    },
  ];
};

export default ({ tab }: Props) => {
  const leftPanel = useMemo<ReactNode | undefined>(() => {
    switch (tab) {
      case "scene":
        return <SidePanel location="left" contents={getSceneContents()} />;
      case "story":
        return <SidePanel location="left" contents={getStoryContents()} />;
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
