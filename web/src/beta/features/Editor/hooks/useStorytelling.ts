import { useState, useCallback, useMemo, useRef } from "react";

import { StoryPanelRef } from "@reearth/beta/features/Visualizer/Crust/StoryPanel";
import useStorytellingAPI from "@reearth/services/api/storytellingApi";
import { useT } from "@reearth/services/i18n";

type Props = {
  sceneId: string;
};

export default function ({ sceneId }: Props) {
  const t = useT();

  const storyPanelRef = useRef<StoryPanelRef | null>(null);
  const [selectedStoryPageId, setSelectedStoryPageId] = useState<string | undefined>(undefined);

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

  const currentStoryPage = useMemo(
    () => selectedStory?.pages?.find(p => p.id === selectedStoryPageId),
    [selectedStory?.pages, selectedStoryPageId],
  );

  const handleCurrentStoryPageChange = useCallback(
    (pageId?: string) => {
      if (selectedStoryPageId && selectedStoryPageId === pageId) return;
      const newPage = selectedStory?.pages?.find(p => p.id === pageId);
      if (newPage) {
        storyPanelRef?.current?.handleCurrentPageChange(pageId);
      }
    },
    [selectedStoryPageId, selectedStory?.pages],
  );

  const handleStoryPageDuplicate = useCallback(async (pageId: string) => {
    console.log("onPageDuplicate", pageId);
    alert("not implemented");
  }, []);

  const handleStoryPageDelete = useCallback(
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
        handleCurrentStoryPageChange(
          pages[deletedPageIndex + 1].id ?? pages[deletedPageIndex - 1].id,
        );
      }
    },
    [selectedStory, sceneId, selectedStoryPageId, handleCurrentStoryPageChange, useDeleteStoryPage],
  );

  const handleStoryPageAdd = useCallback(
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

  const handleStoryPageMove = useCallback(
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

  const handleStoryPageUpdate = useCallback(
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
    currentStoryPage,
    installableStoryBlocks,
    handleCurrentStoryPageChange,
    handleStoryPageDuplicate,
    handleStoryPageDelete,
    handleStoryPageAdd,
    handleStoryPageMove,
    handleStoryPageUpdate,
    handleStoryBlockMove,
    selectStoryPage: setSelectedStoryPageId,
  };
}
