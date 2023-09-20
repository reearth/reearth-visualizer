import { useCallback, useMemo, useState } from "react";

import { FlyTo } from "@reearth/beta/lib/core/types";
import { Camera } from "@reearth/beta/utils/value";
import useStorytellingAPI from "@reearth/services/api/storytellingApi";
import { Page } from "@reearth/services/api/storytellingApi/utils";
import { useT } from "@reearth/services/i18n";

type Props = {
  sceneId: string;
  onFlyTo: FlyTo;
};

const getPage = (id?: string, pages?: Page[]) => {
  if (!id || !pages || !pages.length) return;
  return pages.find(p => p.id === id);
};

export default function ({ sceneId, onFlyTo }: Props) {
  const t = useT();
  const {
    useStoriesQuery,
    useCreateStoryPage,
    useDeleteStoryPage,
    useMoveStoryPage,
    useInstallableStoryBlocksQuery,
    useInstalledStoryBlocksQuery,
  } = useStorytellingAPI();

  const { stories } = useStoriesQuery({ sceneId });

  const { installableStoryBlocks } = useInstallableStoryBlocksQuery({ sceneId });
  const [currentPageId, setCurrentPageId] = useState<string | undefined>(undefined);
  const [isAutoScrolling, setAutoScrolling] = useState(false);

  const selectedStory = useMemo(() => {
    return stories?.length ? stories[0] : undefined;
  }, [stories]);

  const currentPage = useMemo(() => {
    if (!currentPageId && selectedStory?.pages?.length) {
      return selectedStory?.pages[0];
    }

    return getPage(currentPageId, selectedStory?.pages);
  }, [currentPageId, selectedStory?.pages]);

  const storyId = selectedStory && selectedStory?.id;
  const pageId = currentPageId;

  const { installedStoryBlocks } = useInstalledStoryBlocksQuery({
    sceneId,
    lang: undefined,
    storyId,
    pageId,
  });

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
      const camera = newPage.property.items?.find(i => i.schemaGroup === "cameraAnimation");
      if (camera && "fields" in camera) {
        const destination = camera.fields.find(f => f.id === "cameraPosition")?.value as Camera;
        if (!destination) return;

        const duration = camera.fields.find(f => f.id === "cameraDuration")?.value as number;
        // const delay = camera.fields.find(f => f.id === "cameraDelay")?.value as number;
        // console.log(destination);
        // console.log(duration);
        // console.log(delay);
        onFlyTo({ ...destination }, { duration });
      }
    },
    [selectedStory?.pages, onFlyTo],
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
        index: selectedStory.pages?.length,
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
    installedStoryBlocks,
    handleAutoScrollingChange,
    handleCurrentPageChange,
    handlePageDuplicate,
    handlePageDelete,
    handlePageAdd,
    handlePageMove,
  };
}
