import { forwardRef, memo, ReactNode, Ref, RefObject, useMemo } from "react";
import { createPortal } from "react-dom";

import { BlockProvider } from "@reearth/beta/features/Visualizer/shared/contexts/blockContext";
import { EditModeProvider } from "@reearth/beta/features/Visualizer/shared/contexts/editModeContext";
import { BlockProps, InstallableBlock } from "@reearth/beta/features/Visualizer/shared/types";
import { ValueType, ValueTypes } from "@reearth/beta/utils/value";
import { styled } from "@reearth/services/theme";

import { STORY_PANEL_WIDTH } from "./constants";
import { PanelProvider, StoryPanelContext } from "./context";
import useHooks, { type StoryPanelRef, type Story } from "./hooks";
import PageIndicator from "./PageIndicator";
import StoryContent from "./PanelContent";
import { StoryBlock } from "./types";

export type { Story, StoryPage, StoryPanelRef } from "./hooks";

export type InstallableStoryBlock = InstallableBlock & {
  type?: "StoryBlock";
};

export type StoryPanelProps = {
  storyWrapperRef?: RefObject<HTMLDivElement>;
  selectedStory?: Story;
  isEditable?: boolean;
  installableStoryBlocks?: InstallableStoryBlock[];
  onStoryPageChange?: (id?: string, disableScrollIntoView?: boolean) => void;
  onStoryBlockCreate?: (
    pageId?: string | undefined,
    extensionId?: string | undefined,
    pluginId?: string | undefined,
    index?: number | undefined,
  ) => Promise<void>;
  onStoryBlockMove?: (id: string, targetId: number, blockId: string) => void;
  onStoryBlockDelete?: (pageId?: string | undefined, blockId?: string | undefined) => Promise<void>;
  onPropertyValueUpdate?: (
    propertyId?: string,
    schemaItemId?: string,
    fieldId?: string,
    itemId?: string,
    vt?: ValueType,
    v?: ValueTypes[ValueType],
  ) => Promise<void>;
  onPropertyItemAdd?: (propertyId?: string, schemaGroupId?: string) => Promise<void>;
  onPropertyItemMove?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string,
    index?: number,
  ) => Promise<void>;
  onPropertyItemDelete?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string,
  ) => Promise<void>;
  renderBlock?: (block: BlockProps<StoryBlock>) => ReactNode;
};

export const StoryPanel = memo(
  forwardRef<any, StoryPanelProps>(
    (
      {
        storyWrapperRef,
        selectedStory,
        isEditable,
        installableStoryBlocks,
        onStoryPageChange,
        onStoryBlockCreate,
        onStoryBlockMove,
        onStoryBlockDelete,
        onPropertyValueUpdate,
        onPropertyItemAdd,
        onPropertyItemMove,
        onPropertyItemDelete,
        renderBlock,
      },
      ref: Ref<StoryPanelRef>,
    ) => {
      const {
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
      } = useHooks(
        {
          selectedStory,
          isEditable,
          onStoryPageChange,
        },
        ref,
      );

      const panelContext: StoryPanelContext = useMemo(
        () => ({
          pageIds: selectedStory?.pages.map(p => p.id),
          onJumpToPage: (pageIndex: number) => {
            const pageId = selectedStory?.pages[pageIndex].id;
            if (!pageId) return;
            const element = document.getElementById(pageId);
            if (!element) return;
            setCurrentPageId(pageId);
            setLayerOverride(undefined);
            element.scrollIntoView({ behavior: "instant" } as unknown as ScrollToOptions); // TODO: when typescript is updated to 5.1, remove this cast
          },
        }),
        [selectedStory?.pages, setCurrentPageId, setLayerOverride],
      );

      const editModeContext = useMemo(
        () => ({
          disableSelection,
          onSelectionDisable: handleSelectionDisable,
        }),
        [disableSelection, handleSelectionDisable],
      );

      const blockContext = useMemo(
        () => ({
          layerOverride,
          onLayerOverride: handleLayerOverride,
        }),
        [layerOverride, handleLayerOverride],
      );

      return (
        (storyWrapperRef?.current &&
          createPortal(
            <PanelProvider value={panelContext}>
              <EditModeProvider value={editModeContext}>
                <BlockProvider value={blockContext}>
                  <PanelWrapper bgColor={selectedStory?.bgColor}>
                    {!!pageInfo && (
                      <PageIndicator
                        currentPage={pageInfo.currentPage}
                        pageTitles={pageInfo.pageTitles}
                        maxPage={pageInfo.maxPage}
                        onPageChange={pageInfo.onPageChange}
                      />
                    )}
                    <StoryContent
                      pages={selectedStory?.pages}
                      selectedPageId={selectedPageId}
                      selectedStoryBlockId={selectedBlockId}
                      installableStoryBlocks={installableStoryBlocks}
                      showPageSettings={showPageSettings}
                      showingIndicator={!!pageInfo}
                      isAutoScrolling={isAutoScrolling}
                      isEditable={isEditable}
                      onPageSettingsToggle={handlePageSettingsToggle}
                      onPageSelect={handlePageSelect}
                      onCurrentPageChange={handleCurrentPageChange}
                      onBlockCreate={onStoryBlockCreate}
                      onBlockMove={onStoryBlockMove}
                      onBlockDelete={onStoryBlockDelete}
                      onBlockSelect={handleBlockSelect}
                      onBlockDoubleClick={handleBlockDoubleClick}
                      onPropertyUpdate={onPropertyValueUpdate}
                      onPropertyItemAdd={onPropertyItemAdd}
                      onPropertyItemMove={onPropertyItemMove}
                      onPropertyItemDelete={onPropertyItemDelete}
                      renderBlock={renderBlock}
                    />
                  </PanelWrapper>
                </BlockProvider>
              </EditModeProvider>
            </PanelProvider>,
            storyWrapperRef.current,
          )) ?? <div />
      );
    },
  ),
);

export default StoryPanel;

const PanelWrapper = styled("div")<{ bgColor?: string }>(({ bgColor, theme }) => ({
  flex: `0 0 ${STORY_PANEL_WIDTH}px`,
  background: bgColor,
  width: `${STORY_PANEL_WIDTH}px`,
  color: theme.content.weak,
}));
