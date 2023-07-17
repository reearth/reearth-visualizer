import { ReactNode, useMemo } from "react";

import StorySidePanel from "@reearth/beta/features/Editor/tabs/story/SidePanel";
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
            onStorySelect={() => console.log("onSelectStory")}
            onStoryAdd={() => console.log("onStoryAdd")}
            selectedPageId={"1"}
            onPageSelect={() => console.log("onSelectPage")}
            onPageAdd={() => console.log("onPageAdd")}
            onPageDuplicate={() => console.log("onPageDuplicate")}
            onPageDelete={() => console.log("onPageDelete")}
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
