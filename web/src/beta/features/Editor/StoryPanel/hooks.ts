import { useCallback, useEffect, useMemo, useState } from "react";

import useStorytellingAPI from "@reearth/services/api/storytellingApi";
import { StoryFragmentFragment, StoryPageFragmentFragment } from "@reearth/services/gql";

export const pageElementId = "story-page";

export default ({
  sceneId,
  selectedStory,
  selectedPage,
  onPageSelect,
}: {
  sceneId?: string;
  selectedStory?: StoryFragmentFragment;
  selectedPage?: StoryPageFragmentFragment;
  onPageSelect: (id: string) => void;
}) => {
  const [selectedStoryBlockId, setSelectedStoryBlockId] = useState<string>();

  const { useInstallableStoryBlocksQuery } = useStorytellingAPI();

  useEffect(() => {
    if (selectedPage) {
      document.getElementById(selectedPage.id)?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedPage]);

  const pageInfo = useMemo(() => {
    const pages = selectedStory?.pages ?? [];
    if ((pages?.length ?? 0) < 2) return;

    const currentIndex = pages.findIndex(p => p.id === selectedPage?.id);
    return {
      currentPage: currentIndex + 1,
      maxPage: pages.length,
      onPageChange: (page: number) => onPageSelect(pages[page - 1]?.id),
    };
  }, [onPageSelect, selectedPage, selectedStory]);

  const pageHeight = useMemo(() => {
    const element = document.getElementById(pageElementId);
    return element?.clientHeight;
  }, []);

  const { installableStoryBlocks } = useInstallableStoryBlocksQuery({ sceneId });

  const handleStoryBlockSelect = useCallback((blockId: string) => {
    setSelectedStoryBlockId(id => (id === blockId ? undefined : blockId));
  }, []);

  return {
    pageInfo,
    pageHeight,
    installableStoryBlocks,
    selectedStoryBlockId,
    handleStoryBlockSelect,
  };
};
