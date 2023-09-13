import { useCallback, useMemo, useState } from "react";

import useStorytellingAPI from "@reearth/services/api/storytellingApi";
import { StoryFragmentFragment, StoryPageFragmentFragment } from "@reearth/services/gql";
import { useT } from "@reearth/services/i18n";

type Props = {
  sceneId: string;
  stories: StoryFragmentFragment[];
};

const getPage = (id?: string, pages?: StoryPageFragmentFragment[]) => {
  if (!id || !pages || !pages.length) return;
  return pages.find(p => p.id === id);
};

export default function ({ sceneId, stories }: Props) {
  const t = useT();
  const {
    useCreateStoryPage,
    useDeleteStoryPage,
    useMoveStoryPage,
    useInstallableStoryBlocksQuery,
  } = useStorytellingAPI();

  const { installableStoryBlocks } = useInstallableStoryBlocksQuery({ sceneId });
  const [currentPageId, setCurrentPageId] = useState<string | undefined>(undefined);
  const [isAutoScrolling, setAutoScrolling] = useState(false);

  const selectedStory = useMemo(() => {
    return stories.length ? stories[0] : undefined;
  }, [stories]);

  const currentPage = useMemo(() => {
    if (!currentPageId && selectedStory?.pages?.length) {
      return selectedStory?.pages[0];
    }

    return getPage(currentPageId, selectedStory?.pages);
  }, [currentPageId, selectedStory?.pages]);

  const handleAutoScrollingChange = useCallback(
    (isScrolling: boolean) => setAutoScrolling(isScrolling),
    [],
  );

  const handleCurrentPageChange = useCallback(
    (pageId: string, disableScrollIntoView?: boolean) => {
      const newPage = getPage(pageId, selectedStory?.pages);
      if (!newPage) return;
      setCurrentPageId(pageId);
      if (!disableScrollIntoView) {
        const element = document.getElementById(newPage.id);
        setAutoScrolling(true);
        element?.scrollIntoView({ behavior: "smooth" });
      }
    },
    [selectedStory?.pages],
  );

  const handlePageDuplicate = useCallback(async (pageId: string) => {
    console.log("onPageDuplicate", pageId);
    alert("not implemented");
  }, []);

  const handlePageDelete = useCallback(
    async (pageId: string) => {
      if (!selectedStory) return;
      const pages = selectedStory?.pages ?? [];
      const deletedPageIndex = pages.findIndex(p => p.id === pageId);

      await useDeleteStoryPage({
        sceneId,
        storyId: selectedStory.id,
        pageId,
      });
      if (pageId === currentPageId) {
        setCurrentPageId(pages[deletedPageIndex + 1]?.id ?? pages[deletedPageIndex - 1]?.id);
      }
    },
    [useDeleteStoryPage, sceneId, currentPageId, selectedStory],
  );

  const handlePageAdd = useCallback(
    async (isSwipeable: boolean) => {
      if (!selectedStory) return;
      await useCreateStoryPage({
        sceneId,
        storyId: selectedStory.id,
        swipeable: isSwipeable,
        title: t("Page"),
        index: selectedStory.pages.length,
        layers: [],
        swipeableLayers: [],
      });
    },
    [useCreateStoryPage, sceneId, selectedStory, t],
  );

  const handlePageMove = useCallback(
    async (id: string, targetIndex: number) => {
      if (!selectedStory) return;
      await useMoveStoryPage({
        storyId: selectedStory.id,
        pageId: id,
        index: targetIndex,
      });
    },
    [useMoveStoryPage, selectedStory],
  );

  return {
    selectedStory,
    currentPage,
    isAutoScrolling,
    installableStoryBlocks,
    handleAutoScrollingChange,
    handleCurrentPageChange,
    handlePageDuplicate,
    handlePageDelete,
    handlePageAdd,
    handlePageMove,
  };
}
