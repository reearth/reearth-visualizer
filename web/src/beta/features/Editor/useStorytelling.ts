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
  const { useCreateStoryPage, useDeleteStoryPage, useMoveStoryPage } = useStorytellingAPI();
  const [selectedPageId, setSelectedPageId] = useState<string | undefined>(undefined);

  const selectedStory = useMemo(() => {
    return stories.length ? stories[0] : undefined;
  }, [stories]);

  const selectedPage = useMemo(() => {
    if (!selectedPageId && selectedStory?.pages?.length) {
      return selectedStory?.pages[0];
    }

    return getPage(selectedPageId, selectedStory?.pages);
  }, [selectedPageId, selectedStory?.pages]);

  const handlePageSelect = useCallback(
    (pageId: string) => {
      const newPage = getPage(pageId, selectedStory?.pages);
      if (!newPage) return;
      setSelectedPageId(pageId);
      const element = document.getElementById(newPage?.id);
      element?.scrollIntoView({ behavior: "smooth" });
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
      if (pageId === selectedPageId) {
        setSelectedPageId(pages[deletedPageIndex + 1]?.id ?? pages[deletedPageIndex - 1]?.id);
      }
    },
    [useDeleteStoryPage, sceneId, selectedPageId, selectedStory],
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
    selectedPage,
    handlePageSelect,
    handlePageDuplicate,
    handlePageDelete,
    handlePageAdd,
    handlePageMove,
  };
}
