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
  const { createStoryPage, deleteStoryPage } = useStorytellingAPI();
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
  }, []);
  const onPageDelete = useCallback(
    async (pageId: string) => {
      if (!selectedStory) return;
      await deleteStoryPage({
        sceneId,
        storyId: selectedStory.id,
        pageId,
      });
    },
    [deleteStoryPage, sceneId, selectedStory],
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

  return {
    selectedStory,
    selectedPage,
    onPageSelect,
    onPageDuplicate,
    onPageDelete,
    onPageAdd,
  };
}
