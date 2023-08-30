import { useCallback, useEffect, useMemo, useState } from "react";

import useStorytellingAPI from "@reearth/services/api/storytellingApi";
import type { StoryFragmentFragment, StoryPageFragmentFragment } from "@reearth/services/gql";

export type { StoryFragmentFragment, StoryPageFragmentFragment } from "@reearth/services/gql";

export const pageElementId = "story-page";

export default ({
  sceneId,
  selectedStory,
  currentPage,
  onPageSelect,
}: {
  sceneId?: string;
  selectedStory?: StoryFragmentFragment;
  currentPage?: StoryPageFragmentFragment;
  onPageSelect: (id: string) => void;
}) => {
  const [selectedPageId, setSelectedPageId] = useState<string>();
  const [selectedBlockId, setSelectedBlockId] = useState<string>();

  const handlePageSelect = useCallback(
    (pageId?: string) => {
      if (selectedBlockId) {
        setSelectedBlockId(undefined);
      }
      setSelectedPageId(pid => (pageId && pid !== pageId ? pageId : undefined));
    },
    [selectedBlockId],
  );

  const handleBlockSelect = useCallback(
    (blockId?: string) => {
      if (selectedPageId) {
        setSelectedPageId(undefined);
      }
      setSelectedBlockId(id => (!blockId || id === blockId ? undefined : blockId));
    },
    [selectedPageId],
  );

  const { useInstallableStoryBlocksQuery } = useStorytellingAPI();

  const { installableStoryBlocks } = useInstallableStoryBlocksQuery({ sceneId });

  useEffect(() => {
    if (currentPage) {
      document.getElementById(currentPage.id)?.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentPage]);

  const pageInfo = useMemo(() => {
    const pages = selectedStory?.pages ?? [];
    if ((pages?.length ?? 0) < 2) return;

    const currentIndex = pages.findIndex(p => p.id === currentPage?.id);
    return {
      currentPage: currentIndex + 1,
      maxPage: pages.length,
      onPageChange: (page: number) => onPageSelect(pages[page - 1]?.id),
    };
  }, [onPageSelect, currentPage, selectedStory]);

  const pageHeight = useMemo(() => {
    const element = document.getElementById(pageElementId);
    return element?.clientHeight;
  }, []);

  return {
    pageInfo,
    pageHeight,
    installableBlocks: installableStoryBlocks,
    selectedPageId,
    selectedBlockId,
    setSelectedPageId,
    handlePageSelect,
    handleBlockSelect,
  };
};
