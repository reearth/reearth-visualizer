import { ReactNode, useMemo } from "react";

import MapSidePanel from "@reearth/beta/features/Editor/tabs/map/LeftPanel";
import StorySidePanel from "@reearth/beta/features/Editor/tabs/story/LeftPanel";
import { Tab } from "@reearth/beta/features/Navbar";
import {
  NlsLayerCommonFragment,
  StoryFragmentFragment,
  StoryPageFragmentFragment,
} from "@reearth/services/gql";

type Props = {
  tab: Tab;
  sceneId: string;
  layers: NlsLayerCommonFragment[];

  // for story tab
  selectedStory?: StoryFragmentFragment;
  selectedPage?: StoryPageFragmentFragment;
  onPageSelect: (id: string) => void;
  onPageDuplicate: (id: string) => void;
  onPageDelete: (id: string) => void;
  onPageAdd: (isSwipeable: boolean) => void;
  onPageMove: (id: string, targetIndex: number) => void;

  // for layers
  selectedLayer?: NlsLayerCommonFragment;
  onLayerDelete: (id: string) => void;
  onLayerSelect: (id: string) => void;
};

export default ({
  tab,
  sceneId,
  layers,
  selectedStory,
  selectedPage,
  onPageSelect,
  onPageDuplicate,
  onPageDelete,
  onPageAdd,
  onPageMove,
  onLayerDelete,
  onLayerSelect,
}: Props) => {
  const leftPanel = useMemo<ReactNode | undefined>(() => {
    switch (tab) {
      case "map":
        return (
          <MapSidePanel
            sceneId={sceneId}
            layers={layers}
            onLayerDelete={onLayerDelete}
            onLayerSelect={onLayerSelect}
          />
        );
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
    tab,
    sceneId,
    layers,
    onLayerDelete,
    onLayerSelect,
    selectedStory,
    selectedPage,
    onPageSelect,
    onPageDuplicate,
    onPageDelete,
    onPageAdd,
    onPageMove,
  ]);

  return {
    leftPanel,
  };
};
