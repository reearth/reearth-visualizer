import { Ref, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";

import type { Story, StoryPage } from "@reearth/beta/lib/core/StoryPanel/types";

import { MapRef } from "../Crust/types";
import { useVisualizer } from "../Visualizer";

import { DEFAULT_STORY_PAGE_DURATION, STORY_PANEL_CONTENT_ELEMENT_ID } from "./constants";
import { formatISO8601 } from "./utils";

export type { Story, StoryPage } from "@reearth/beta/lib/core/StoryPanel/types";

export type StoryPanelRef = {
  currentPageId?: string;
  handleCurrentPageChange: (pageId?: string, disableScrollIntoView?: boolean) => void;
};

export default (
  {
    selectedStory,
    isEditable,
    onCurrentPageChange,
  }: {
    selectedStory?: Story;
    isEditable?: boolean;
    onCurrentPageChange?: (id?: string, disableScrollIntoView?: boolean) => void;
  },
  ref: Ref<StoryPanelRef>,
) => {
  const isAutoScrolling = useRef(false);

  const visualizer = useVisualizer();

  const [showPageSettings, setShowPageSettings] = useState(false);
  const [currentPageId, setCurrentPageId] = useState<string>();
  const [selectedPageId, setSelectedPageId] = useState<string>();
  const [selectedBlockId, setSelectedBlockId] = useState<string>();
  const [disableSelection, setDisableSelection] = useState(false);

  const handleSelectionDisable = useCallback(
    (disabled?: boolean) => setDisableSelection(!!disabled),
    [],
  );

  const [layerOverride, setLayerOverride] = useState<{
    extensionId: string;
    layerIds?: string[];
  }>();

  const handlePageSettingsToggle = useCallback(() => {
    if (!selectedPageId && !isEditable) return;
    setShowPageSettings(show => !show);
  }, [selectedPageId, isEditable]);

  const handlePageSelect = useCallback(
    (pageId?: string) => {
      if (!isEditable || pageId === selectedPageId || disableSelection) return;
      if (selectedBlockId) {
        setSelectedBlockId(undefined);
      }
      setSelectedPageId(pageId);
    },
    [selectedPageId, selectedBlockId, isEditable, disableSelection],
  );

  const handleBlockSelect = useCallback(
    (blockId?: string) => {
      if (!isEditable || blockId === selectedBlockId || disableSelection) return;
      if (selectedPageId) {
        setSelectedPageId(undefined);
      }
      setSelectedBlockId(blockId);
    },
    [selectedPageId, selectedBlockId, isEditable, disableSelection],
  );

  const handleBlockDoubleClick = useCallback(
    (blockId?: string) => {
      if (disableSelection) return;
      setSelectedBlockId(blockId);
    },
    [disableSelection],
  );

  const onTimeChange = useCallback(
    (time: Date) => {
      return visualizer?.current?.timeline?.current?.commit({
        cmd: "SET_TIME",
        payload: {
          start: visualizer?.current?.timeline?.current?.computedTimeline?.start,
          current: time,
          stop: visualizer?.current?.timeline?.current?.computedTimeline?.stop,
        },
        committer: { source: "storyPage", id: currentPageId },
      });
    },
    [currentPageId, visualizer],
  );

  const handlePageTime = useCallback(
    (page: StoryPage) => {
      const timePointField = page.property?.timePoint;
      if (!timePointField?.timePoint?.value) return;
      return onTimeChange?.(new Date(formatISO8601(timePointField?.timePoint?.value) ?? ""));
    },
    [onTimeChange],
  );

  const handleCurrentPageChange = useCallback(
    (pageId?: string, disableScrollIntoView?: boolean) => {
      if (pageId === currentPageId) return;

      const newPage = getPage(pageId, selectedStory?.pages);
      if (!newPage) return;

      onCurrentPageChange?.(newPage.id);
      setCurrentPageId(newPage.id);
      setLayerOverride(undefined);

      if (!pageId) {
        const element = document.getElementById(STORY_PANEL_CONTENT_ELEMENT_ID);
        if (element) element.scrollTo(0, 0); // If no pageId, newPage will be the first page and we scroll all the way to the top here
      } else if (!disableScrollIntoView) {
        const element = document.getElementById(newPage.id);
        isAutoScrolling.current = true;
        element?.scrollIntoView({ behavior: "smooth" });
      }

      handlePageTime(newPage);

      const cameraAnimation = newPage.property?.cameraAnimation;
      const destination = cameraAnimation?.cameraPosition?.value;
      if (!destination) return;

      const duration = cameraAnimation?.cameraDuration?.value ?? DEFAULT_STORY_PAGE_DURATION;

      visualizer.current?.engine.flyTo({ ...destination }, { duration });
    },
    [currentPageId, selectedStory?.pages, onCurrentPageChange, handlePageTime, visualizer],
  );

  const pageInfo = useMemo(() => {
    const pages = selectedStory?.pages ?? [];
    if ((pages?.length ?? 0) < 2) return;

    const currentIndex = pages.findIndex(p => p.id === currentPageId);
    return {
      currentPage: currentIndex + 1,
      pageTitles: pages.map(p => p.property?.title?.title?.value),
      maxPage: pages.length,
      onPageChange: (pageIndex: number) => handleCurrentPageChange(pages[pageIndex - 1]?.id),
    };
  }, [selectedStory, currentPageId, handleCurrentPageChange]);

  const handleLayerReset = useCallback(
    (vizRef?: MapRef | null) => {
      if (!vizRef) return;
      const currentLayerIds = vizRef.layers.layers()?.map(l => l.id);

      const currentPage = getPage(currentPageId, selectedStory?.pages);
      if (currentPage) {
        if (currentLayerIds) {
          vizRef.layers.show(...currentLayerIds.filter(id => currentPage.layerIds?.includes(id)));
          vizRef.layers.hide(...currentLayerIds.filter(id => !currentPage.layerIds?.includes(id)));
        }
      }
    },
    [currentPageId, selectedStory?.pages],
  );

  const handleLayerOverride = useCallback(
    (id?: string, layerIds?: string[]) => {
      const vizRef = visualizer?.current;
      if (!id || id === layerOverride?.extensionId) {
        setLayerOverride(undefined);
        handleLayerReset(vizRef);
        return;
      }
      setLayerOverride({ extensionId: id, layerIds });
      // Show only selected layers
      const layers = vizRef?.layers;
      layers?.show(...(layerIds ?? []));
      const allLayers = layers?.layers() ?? [];
      // Hide the rest
      layers?.hide(...(allLayers.map(({ id }) => id).filter(id => !layerIds?.includes(id)) ?? []));
    },
    [visualizer, layerOverride?.extensionId, handleLayerReset],
  );

  useImperativeHandle(
    ref,
    () => ({
      currentPageId,
      handleCurrentPageChange,
    }),
    [currentPageId, handleCurrentPageChange],
  );

  // On page change, update visible layers in the viz based on page's initial settings.
  useEffect(() => {
    const vizRef = visualizer?.current;
    const currentLayerIds = vizRef?.layers.layers()?.map(l => l.id);
    handleLayerReset(vizRef);

    return () => {
      if (currentLayerIds) vizRef?.layers.show(...currentLayerIds);
    };
  }, [currentPageId, selectedStory?.pages, visualizer, handleLayerReset]);

  // Reset parent of core's current page on StoryPanel unmount
  useEffect(() => {
    return () => onCurrentPageChange?.();
  }, [onCurrentPageChange]);

  return {
    pageInfo,
    selectedPageId,
    selectedBlockId,
    showPageSettings,
    isAutoScrolling,
    layerOverride,
    disableSelection,
    setCurrentPageId,
    setLayerOverride,
    handleSelectionDisable,
    handleLayerOverride,
    handlePageSettingsToggle,
    handlePageSelect,
    handleBlockSelect,
    handleBlockDoubleClick,
    handleCurrentPageChange,
  };
};

const getPage = (id?: string, pages?: StoryPage[]) => {
  if (!pages?.length) return;
  if (!id) return pages[0]; // If no ID, set first page
  return pages.find(p => p.id === id);
};
