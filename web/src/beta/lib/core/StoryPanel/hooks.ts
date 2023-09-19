import { useCallback, useMemo, useState } from "react";

import type { StoryFragmentFragment, StoryPageFragmentFragment } from "@reearth/services/gql";

export type {
  StoryFragmentFragment as GQLStory,
  StoryPageFragmentFragment as GQLStoryPage,
} from "@reearth/services/gql";

export default ({
  selectedStory,
  currentPage,
  isEditable,
  onCurrentPageChange,
}: {
  selectedStory?: StoryFragmentFragment;
  currentPage?: StoryPageFragmentFragment;
  isEditable?: boolean;
  onCurrentPageChange: (id: string, disableScrollIntoView?: boolean) => void;
}) => {
  const [showPageSettings, setShowPageSettings] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState<string>();
  const [selectedBlockId, setSelectedBlockId] = useState<string>();

  const handlePageSettingsToggle = useCallback(() => {
    if (!selectedPageId && !isEditable) return;
    setShowPageSettings(show => !show);
  }, [selectedPageId, isEditable]);

  const handlePageSelect = useCallback(
    (pageId?: string) => {
      if (!isEditable) return;
      if (selectedBlockId) {
        setSelectedBlockId(undefined);
      }
      setSelectedPageId(pid => (pageId && pid !== pageId ? pageId : undefined));
    },
    [selectedBlockId, isEditable],
  );

  const handleBlockSelect = useCallback(
    (blockId?: string) => {
      if (!isEditable) return;
      if (selectedPageId) {
        setSelectedPageId(undefined);
      }
      setSelectedBlockId(id => (!blockId || id === blockId ? undefined : blockId));
    },
    [selectedPageId, isEditable],
  );

  const handleCurrentPageChange = useCallback(
    (pageId: string) => {
      onCurrentPageChange(pageId, true); // true disables scrollIntoView
    },
    [onCurrentPageChange],
  );

  const pageInfo = useMemo(() => {
    const pages = selectedStory?.pages ?? [];
    if ((pages?.length ?? 0) < 2) return;

    const currentIndex = pages.findIndex(p => p.id === currentPage?.id);
    return {
      currentPage: currentIndex + 1,
      maxPage: pages.length,
      onPageChange: (pageIndex: number) => onCurrentPageChange(pages[pageIndex - 1]?.id),
    };
  }, [selectedStory, currentPage, onCurrentPageChange]);

  return {
    pageInfo,
    selectedPageId,
    selectedBlockId,
    showPageSettings,
    handlePageSettingsToggle,
    handlePageSelect,
    handleBlockSelect,
    handleCurrentPageChange,
  };
};
