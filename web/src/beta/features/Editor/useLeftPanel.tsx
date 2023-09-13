import { ReactNode, useMemo } from "react";

import MapSidePanel from "@reearth/beta/features/Editor/tabs/map/LeftPanel";
import StorySidePanel from "@reearth/beta/features/Editor/tabs/story/LeftPanel";
import { Tab } from "@reearth/beta/features/Navbar";
import type { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { StoryFragmentFragment, StoryPageFragmentFragment } from "@reearth/services/gql";

import type { LayerNameUpdateProps } from "./useLayers";

type Props = {
  tab: Tab;
  sceneId: string;
  nlsLayers: NLSLayer[];

  // storytelling
  selectedStory?: StoryFragmentFragment;
  currentPage?: StoryPageFragmentFragment;
  onCurrentPageChange: (id: string) => void;
  onPageDuplicate: (id: string) => void;
  onPageDelete: (id: string) => void;
  onPageAdd: (isSwipeable: boolean) => void;
  onPageMove: (id: string, targetIndex: number) => void;

  // layers
  selectedLayerId?: string;
  onLayerDelete: (id: string) => void;
  onLayerNameUpdate: (inp: LayerNameUpdateProps) => void;
  onLayerSelect: (id: string) => void;
  onDataSourceManagerOpen: () => void;
};

export default ({
  tab,
  sceneId,
  nlsLayers,
  selectedStory,
  selectedLayerId,
  currentPage,
  onCurrentPageChange,
  onPageDuplicate,
  onPageDelete,
  onPageAdd,
  onPageMove,
  onLayerDelete,
  onLayerNameUpdate,
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
            selectedLayerId={selectedLayerId}
            onLayerDelete={onLayerDelete}
            onLayerNameUpdate={onLayerNameUpdate}
            onLayerSelect={onLayerSelect}
            onDataSourceManagerOpen={onDataSourceManagerOpen}
          />
        );
      case "story":
        return (
          <StorySidePanel
            selectedStory={selectedStory}
            selectedPage={currentPage}
            onPageSelect={onCurrentPageChange}
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
    selectedStory,
    selectedLayerId,
    currentPage,
    onLayerDelete,
    onLayerNameUpdate,
    onLayerSelect,
    onDataSourceManagerOpen,
    onCurrentPageChange,
    onPageDuplicate,
    onPageDelete,
    onPageAdd,
    onPageMove,
  ]);

  return {
    leftPanel,
  };
};
