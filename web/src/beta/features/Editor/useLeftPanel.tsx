import { ReactNode, useMemo } from "react";

import StorySidePanel from "@reearth/beta/features/Editor/tabs/Storytelling/StorySidePanel";
import { Tab } from "@reearth/beta/features/Navbar";

type Props = {
  tab: Tab;
};

export default ({ tab }: Props) => {
  const leftPanel = useMemo<ReactNode | undefined>(() => {
    switch (tab) {
      case "scene":
        return <div>TODO: LeftPanel</div>;
      case "story":
        return (
          <StorySidePanel
            stories={[]}
            selectedStory={undefined}
            onSelectStory={() => console.log("onSelectStory")}
            onStoryAdd={() => console.log("onStoryAdd")}
            selectedPageId={"1"}
            onSelectPage={() => console.log("onSelectPage")}
            onPageAdd={() => console.log("onPageAdd")}
          />
        );
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
