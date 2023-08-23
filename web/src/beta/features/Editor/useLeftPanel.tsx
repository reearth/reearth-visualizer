import { ReactNode, useMemo } from "react";

import MapSidePanel from "@reearth/beta/features/Editor/tabs/map/LeftPanel";
import StorySidePanel from "@reearth/beta/features/Editor/tabs/story/LeftPanel";
import { Tab } from "@reearth/beta/features/Navbar";
import { StoryFragmentFragment, StoryPageFragmentFragment } from "@reearth/services/gql";

type Props = {
  tab: Tab;
  sceneId: string;

  // for story tab
  selectedStory?: StoryFragmentFragment;
  selectedPage?: StoryPageFragmentFragment;
  onPageSelect: (id: string) => void;
  onPageDuplicate: (id: string) => void;
  onPageDelete: (id: string) => void;
  onPageAdd: (isSwipeable: boolean) => void;
  onPageMove: (id: string, targetIndex: number) => void;
};

export default ({
  tab,
  sceneId,
  selectedStory,
  selectedPage,
  onPageSelect,
  onPageDuplicate,
  onPageDelete,
  onPageAdd,
  onPageMove,
}: Props) => {
  const leftPanel = useMemo<ReactNode | undefined>(() => {
    switch (tab) {
      case "map":
        return <MapSidePanel sceneId={sceneId} />;
      case "story":
        return (
          <StorySidePanel
            selectedStory={selectedStory}
            selectedPage={selectedPage}
            onPageSelect={onPageSelect}
            onPageDuplicate={onPageDuplicate}
            onPageDelete={onPageDelete}
            onPageAdd={onPageAdd}
            onPageMove={onPageMove}
          />
        );
      case "widgets":
      case "publish":
      default:
        return undefined;
    }
  }, [
    onPageAdd,
    onPageDelete,
    onPageDuplicate,
    onPageMove,
    onPageSelect,
    selectedPage,
    selectedStory,
    tab,
    sceneId,
  ]);

  return {
    leftPanel,
  };
};
