import { StoryPanelRef } from "@reearth/app/features/Visualizer/Crust/StoryPanel";
import {
  useInstallableStoryBlocks,
  useStories,
  useStoryBlockMutations,
  useStoryPageMutations
} from "@reearth/services/api/storytelling";
import { useT } from "@reearth/services/i18n";
import { useState, useCallback, useMemo, useRef } from "react";

type Props = {
  sceneId: string;
};

export default function ({ sceneId }: Props) {
  const t = useT();

  const storyPanelRef = useRef<StoryPanelRef | null>(null);
  const [selectedStoryPageId, setSelectedStoryPageId] = useState<
    string | undefined
  >(undefined);

  const { createStoryPage, deleteStoryPage, moveStoryPage, updateStoryPage } =
    useStoryPageMutations();
  const { moveStoryBlock } = useStoryBlockMutations();

  const { stories } = useStories({ sceneId });
  const { installableStoryBlocks } = useInstallableStoryBlocks({
    sceneId
  });

  const selectedStory = useMemo(
    () => (stories?.length ? stories[0] : undefined),
    [stories]
  );

  const currentStoryPage = useMemo(
    () => selectedStory?.pages?.find((p) => p.id === selectedStoryPageId),
    [selectedStory?.pages, selectedStoryPageId]
  );

  const handleCurrentStoryPageChange = useCallback(
    (pageId?: string) => {
      if (selectedStoryPageId && selectedStoryPageId === pageId) return;
      const newPage = selectedStory?.pages?.find((p) => p.id === pageId);
      if (newPage) {
        storyPanelRef?.current?.handleCurrentPageChange(pageId);
      }
    },
    [selectedStoryPageId, selectedStory?.pages]
  );

  const handleStoryPageDuplicate = useCallback(async (pageId: string) => {
    // TODO: Implement page duplication functionality
    console.warn(
      "Story page duplication not yet implemented for page:",
      pageId
    );
  }, []);

  const handleStoryPageDelete = useCallback(
    async (pageId: string) => {
      if (!selectedStory) return;
      const pages = selectedStory?.pages ?? [];
      const deletedPageIndex = pages.findIndex((p) => p.id === pageId);

      await deleteStoryPage({
        sceneId,
        storyId: selectedStory.id,
        pageId
      });
      if (pageId === selectedStoryPageId) {
        handleCurrentStoryPageChange(
          pages[deletedPageIndex + 1].id ?? pages[deletedPageIndex - 1].id
        );
      }
    },
    [
      selectedStory,
      sceneId,
      selectedStoryPageId,
      handleCurrentStoryPageChange,
      deleteStoryPage
    ]
  );

  const handleStoryPageAdd = useCallback(
    async (isSwipeable: boolean) => {
      if (!selectedStory) return;
      await createStoryPage({
        sceneId,
        storyId: selectedStory.id,
        swipeable: isSwipeable,
        title: t("Page"),
        index: selectedStory.pages?.length,
        layers: [],
        swipeableLayers: []
      });
    },
    [createStoryPage, sceneId, selectedStory, t]
  );

  const handleStoryPageMove = useCallback(
    async (id: string, targetIndex: number) => {
      if (!selectedStory) return;
      await moveStoryPage({
        storyId: selectedStory.id,
        pageId: id,
        index: targetIndex
      });
    },
    [moveStoryPage, selectedStory]
  );

  const handleStoryBlockMove = useCallback(
    async (id: string, targetIndex: number, blockId: string) => {
      if (!selectedStory) return;
      await moveStoryBlock({
        storyId: selectedStory.id,
        pageId: id,
        index: targetIndex,
        blockId
      });
    },
    [moveStoryBlock, selectedStory]
  );

  const handleStoryPageUpdate = useCallback(
    async (pageId: string, layers: string[]) => {
      if (!selectedStory) return;
      await updateStoryPage({
        sceneId,
        storyId: selectedStory.id,
        pageId,
        layers
      });
    },
    [sceneId, selectedStory, updateStoryPage]
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
    selectStoryPage: setSelectedStoryPageId
  };
}
