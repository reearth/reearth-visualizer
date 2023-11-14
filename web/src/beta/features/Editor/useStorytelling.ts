import { useCallback, useMemo, useRef } from "react";

import { StoryPanelRef } from "@reearth/beta/lib/core/StoryPanel";
import useStorytellingAPI from "@reearth/services/api/storytellingApi";
import type { Page } from "@reearth/services/api/storytellingApi/utils";
import { useT } from "@reearth/services/i18n";
import { useSelectedStoryPageId } from "@reearth/services/state";

type Props = {
  sceneId: string;
};

const getPage = (id?: string, pages?: Page[]) => {
  if (!id || !pages || !pages.length) return;
  return pages.find(p => p.id === id);
};

export default function ({ sceneId }: Props) {
  const t = useT();

  const storyPanelRef = useRef<StoryPanelRef | null>(null);
  const [selectedStoryPageId] = useSelectedStoryPageId();

  const {
    useStoriesQuery,
    useCreateStoryPage,
    useDeleteStoryPage,
    useMoveStoryPage,
    useMoveStoryBlock,
    useUpdateStoryPage,
    useInstallableStoryBlocksQuery,
  } = useStorytellingAPI();

  const { stories } = useStoriesQuery({ sceneId });
  const { installableStoryBlocks } = useInstallableStoryBlocksQuery({ sceneId });

  const selectedStory = useMemo(() => (stories?.length ? stories[0] : undefined), [stories]);

  const currentPage = useMemo(
    () => selectedStory?.pages?.find(p => p.id === selectedStoryPageId),
    [selectedStory?.pages, selectedStoryPageId],
  );

  const handleCurrentPageChange = useCallback(
    (pageId: string) => {
      if (selectedStoryPageId && selectedStoryPageId === pageId) return;
      const newPage = getPage(pageId, selectedStory?.pages);
      if (newPage) {
        storyPanelRef?.current?.handleCurrentPageChange(pageId);
      }
    },
    [selectedStoryPageId, selectedStory?.pages],
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
      if (pageId === selectedStoryPageId) {
        handleCurrentPageChange(pages[deletedPageIndex + 1].id ?? pages[deletedPageIndex - 1].id);
      }
    },
    [selectedStory, sceneId, selectedStoryPageId, handleCurrentPageChange, useDeleteStoryPage],
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

  const handleStoryBlockMove = useCallback(
    async (id: string, targetIndex: number, blockId: string) => {
      if (!selectedStory) return;
      await useMoveStoryBlock({
        storyId: selectedStory.id,
        pageId: id,
        index: targetIndex,
        blockId,
      });
    },
    [useMoveStoryBlock, selectedStory],
  );

  const handlePageUpdate = useCallback(
    async (pageId: string, layers: string[]) => {
      if (!selectedStory) return;
      await useUpdateStoryPage({
        sceneId,
        storyId: selectedStory.id,
        pageId,
        layers,
      });
    },
    [sceneId, selectedStory, useUpdateStoryPage],
  );

  return {
    storyPanelRef,
    selectedStory,
    currentPage,
    installableStoryBlocks,
    handleCurrentPageChange,
    handlePageDuplicate,
    handlePageDelete,
    handlePageAdd,
    handlePageMove,
    handleStoryBlockMove,
    handlePageUpdate,
  };
}
