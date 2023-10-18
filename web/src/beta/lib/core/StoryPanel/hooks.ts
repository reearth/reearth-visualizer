import { useCallback, useMemo, useState } from "react";

import type { Story } from "@reearth/beta/lib/core/StoryPanel/types";

export type { Story, StoryPage } from "@reearth/beta/lib/core/StoryPanel/types";

export default ({
  selectedStory,
  currentPageId,
  isEditable,
  onCurrentPageChange,
}: {
  selectedStory?: Story;
  currentPageId?: string;
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
      if (currentPageId === pageId) return;
      onCurrentPageChange(pageId, true); // true disables scrollIntoView
    },
    [currentPageId, onCurrentPageChange],
  );

  const pageInfo = useMemo(() => {
    const pages = selectedStory?.pages ?? [];
    if ((pages?.length ?? 0) < 2) return;

    const currentIndex = pages.findIndex(p => p.id === currentPageId);
    return {
      currentPage: currentIndex + 1,
      maxPage: pages.length,
      onPageChange: (pageIndex: number) => onCurrentPageChange(pages[pageIndex - 1]?.id),
    };
  }, [selectedStory, currentPageId, onCurrentPageChange]);

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
