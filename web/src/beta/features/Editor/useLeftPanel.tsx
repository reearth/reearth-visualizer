import { ReactNode, useMemo } from "react";

import MapSidePanel from "@reearth/beta/features/Editor/tabs/map/LeftPanel";
import StorySidePanel from "@reearth/beta/features/Editor/tabs/story/LeftPanel";
import { Tab } from "@reearth/beta/features/Navbar";
import type { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { StoryFragmentFragment, StoryPageFragmentFragment } from "@reearth/services/gql";

type Props = {
  tab: Tab;
  sceneId: string;
  nlsLayers: NLSLayer[];

  // for story tab
  selectedStory?: StoryFragmentFragment;
  selectedPage?: StoryPageFragmentFragment;
  onPageSelect: (id: string) => void;
  onPageDuplicate: (id: string) => void;
  onPageDelete: (id: string) => void;
  onPageAdd: (isSwipeable: boolean) => void;
  onPageMove: (id: string, targetIndex: number) => void;

  // for nlsLayers
  selectedLayer?: NLSLayer;
  onLayerDelete: (id: string) => void;
  onLayerSelect: (id: string) => void;
  onDataSourceManagerOpen: () => void;
};

export default ({
  tab,
  sceneId,
  nlsLayers,
  selectedStory,
  selectedPage,
  onPageSelect,
  onPageDuplicate,
  onPageDelete,
  onPageAdd,
  onPageMove,
  onLayerDelete,
  onLayerSelect,
  onDataSourceManagerOpen,
}: Props) => {
  const leftPanel = useMemo<ReactNode | undefined>(() => {
    switch (tab) {
      case "map":
        return (
          <MapSidePanel
            sceneId={sceneId}
            layers={nlsLayers}
            onLayerDelete={onLayerDelete}
            onLayerSelect={onLayerSelect}
            onDataSourceManagerOpen={onDataSourceManagerOpen}
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
    nlsLayers,
    onLayerDelete,
    onLayerSelect,
    onDataSourceManagerOpen,
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
