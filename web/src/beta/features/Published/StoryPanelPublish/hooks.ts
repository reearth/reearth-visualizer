import { useCallback, useMemo, useState } from "react";

export const pageElementId = "story-page";

export default () => {
  const [selectedPageId, setSelectedPageId] = useState<string | undefined>(undefined);
  const sceneJson = localStorage.getItem("storyData");
  const scene = sceneJson !== null && JSON.parse(sceneJson);

  const selectedStory = useMemo(() => {
    return scene?.stories.length ? scene?.stories[0] : undefined;
  }, [scene?.stories]);

  const selectedPage = useMemo(() => {
    if (!selectedPageId && selectedStory?.pages?.length) {
      return selectedStory?.pages[0];
    }

    return (selectedStory?.pages ?? []).find(p => p.id === selectedPageId);
  }, [selectedPageId, selectedStory?.pages]);

  const handlePageSelect = useCallback((pageId: string) => {
    setSelectedPageId(pageId);
  }, []);

  const pageInfo = useMemo(() => {
    const pages = selectedStory?.pages ?? [];
    if ((pages?.length ?? 0) < 2) return;

    const currentIndex = pages.findIndex(p => p.id === selectedPage?.id);
    return {
      selectedPage: currentIndex + 1,
      maxPage: pages.length,
      onPageChange: (page: number) => handlePageSelect(pages[page - 1]?.id),
    };
  }, [handlePageSelect, selectedPage, selectedStory]);

  return {
    pageInfo,
    pageElementId,
    selectedPage,
    selectedStory,
    handlePageSelect,
  };
};
