import dayjs from "dayjs";
import { useCallback, useMemo, useState } from "react";

import useStorytellingAPI from "@reearth/services/api/storytellingApi";
import { StoryFragmentFragment } from "@reearth/services/gql";
import { useT } from "@reearth/services/i18n";

type Props = {
  sceneId: string;
  stories: StoryFragmentFragment[];
};
export default function useStorytelling({ sceneId, stories }: Props) {
  const t = useT();
  const { createStoryPage, deleteStoryPage, moveStoryPage } = useStorytellingAPI();
  const [selectedPageId, setSelectedPageId] = useState<string | undefined>(undefined);

  const selectedStory = useMemo(() => {
    return stories.length ? stories[0] : undefined;
  }, [stories]);

  const selectedPage = useMemo(() => {
    if (!selectedPageId && selectedStory?.pages?.length) {
      return selectedStory?.pages[0];
    }

    return (selectedStory?.pages ?? []).find(p => p.id === selectedPageId);
  }, [selectedPageId, selectedStory?.pages]);

  const onPageSelect = useCallback((pageId: string) => {
    setSelectedPageId(pageId);
  }, []);
  const onPageDuplicate = useCallback(async (pageId: string) => {
    console.log("onPageDuplicate", pageId);
    alert("not implemented");
  }, []);
  const onPageDelete = useCallback(
    async (pageId: string) => {
      if (!selectedStory) return;
      const pages = selectedStory?.pages ?? [];
      const deletedPageIndex = pages.findIndex(p => p.id === pageId);

      await deleteStoryPage({
        sceneId,
        storyId: selectedStory.id,
        pageId,
      });
      if (pageId === selectedPageId) {
        setSelectedPageId(pages[deletedPageIndex + 1]?.id ?? pages[deletedPageIndex - 1]?.id);
      }
    },
    [deleteStoryPage, sceneId, selectedPageId, selectedStory],
  );
  const onPageAdd = useCallback(
    async (isSwipeable: boolean) => {
      if (!selectedStory) return;
      await createStoryPage({
        sceneId,
        storyId: selectedStory.id,
        swipeable: isSwipeable,
        // TODO delete dummy date usage
        title: t("Page") + dayjs().format("YYYY/MM/DD HH:mm:ss"),
        index: selectedStory.pages.length,
        layers: [],
        swipeableLayers: [],
      });
    },
    [createStoryPage, sceneId, selectedStory, t],
  );
  const onPageMove = useCallback(
    async (id: string, targetIndex: number) => {
      if (!selectedStory) return;
      await moveStoryPage({
        storyId: selectedStory.id,
        pageId: id,
        index: targetIndex,
      });
    },
    [moveStoryPage, selectedStory],
  );

  return {
    selectedStory,
    selectedPage,
    onPageSelect,
    onPageDuplicate,
    onPageDelete,
    onPageAdd,
    onPageMove,
  };
}
