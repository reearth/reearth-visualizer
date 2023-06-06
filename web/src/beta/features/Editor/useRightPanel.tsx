import { ReactNode, useMemo } from "react";

import { Tab } from "@reearth/beta/features/Navbar";
import SidePanel, { SidePanelContent } from "@reearth/beta/features/SidePanel";

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

const getWidgetContents = (): SidePanelContent[] => {
  return [
    {
      id: "Widget Manager",
      title: "Widget Manager",
      children: (
        <>
          {[...Array(100)].map((_, i) => (
            <div key={i}>scrollable / {i}</div>
          ))}
        </>
      ),
    },
    {
      id: "Widget Setting",
      title: "Widget Setting",
      maxHeight: "30%",
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
  const rightPanel = useMemo<ReactNode | undefined>(() => {
    switch (tab) {
      case "scene":
        return <SidePanel location="right" contents={getSceneContents()} />;
      case "story":
        return <SidePanel location="right" contents={getStoryContents()} />;
      case "widgets":
        return <SidePanel location="right" contents={getWidgetContents()} />;

      case "publish":
      default:
        return undefined;
    }
  }, [tab]);

  return {
    rightPanel,
  };
};
