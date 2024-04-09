import { forwardRef, memo, Ref, RefObject, useMemo } from "react";
import { createPortal } from "react-dom";

import { ValueType, ValueTypes } from "@reearth/beta/utils/value";
import { styled } from "@reearth/services/theme";

import { BlockProvider } from "../shared/contexts/blockContext";
import { EditModeProvider } from "../shared/contexts/editModeContext";
import { InstallableBlock } from "../shared/types";

import { STORY_PANEL_WIDTH } from "./constants";
import { PanelProvider, StoryPanelContext } from "./context";
import useHooks, { type StoryPanelRef, type Story } from "./hooks";
import PageIndicator from "./PageIndicator";
import StoryContent from "./PanelContent";

export type { Story, StoryPage, StoryPanelRef } from "./hooks";

export type InstallableStoryBlock = InstallableBlock & {
  type?: "StoryBlock";
};

type PropertyProps = {
  handlePropertyValueUpdate?: (
    propertyId?: string,
    schemaItemId?: string,
    fieldId?: string,
    itemId?: string,
    vt?: ValueType,
    v?: ValueTypes[ValueType],
  ) => Promise<void>;
  handlePropertyItemAdd?: (propertyId?: string, schemaGroupId?: string) => Promise<void>;
  handlePropertyItemMove?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string,
    index?: number,
  ) => Promise<void>;
  handlePropertyItemDelete?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string,
  ) => Promise<void>;
};

export type StoryPanelProps = {
  storyWrapperRef?: RefObject<HTMLDivElement>;
  selectedStory?: Story;
  isEditable?: boolean;
  installableStoryBlocks?: InstallableStoryBlock[];
  handleStoryPageChange?: (id?: string, disableScrollIntoView?: boolean) => void;
  handleStoryBlockCreate?: (
    pageId?: string | undefined,
    extensionId?: string | undefined,
    pluginId?: string | undefined,
    index?: number | undefined,
  ) => Promise<void>;
  handleStoryBlockMove?: (id: string, targetId: number, blockId: string) => void;
  handleStoryBlockDelete?: (
    pageId?: string | undefined,
    blockId?: string | undefined,
  ) => Promise<void>;
} & PropertyProps;

export const StoryPanel = memo(
  forwardRef<any, StoryPanelProps>(
    (
      {
        storyWrapperRef,
        selectedStory,
        isEditable,
        installableStoryBlocks,
        handleStoryPageChange,
        handleStoryBlockCreate,
        handleStoryBlockMove,
        handleStoryBlockDelete,
        handlePropertyValueUpdate,
        handlePropertyItemAdd,
        handlePropertyItemMove,
        handlePropertyItemDelete,
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
          handleStoryPageChange,
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
                      onBlockCreate={handleStoryBlockCreate}
                      onBlockMove={handleStoryBlockMove}
                      onBlockDelete={handleStoryBlockDelete}
                      onBlockSelect={handleBlockSelect}
                      onBlockDoubleClick={handleBlockDoubleClick}
                      onPropertyUpdate={handlePropertyValueUpdate}
                      onPropertyItemAdd={handlePropertyItemAdd}
                      onPropertyItemMove={handlePropertyItemMove}
                      onPropertyItemDelete={handlePropertyItemDelete}
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

const PanelWrapper = styled.div<{ bgColor?: string }>`
  flex: 0 0 ${STORY_PANEL_WIDTH}px;
  width: ${STORY_PANEL_WIDTH}px;
  background: ${({ bgColor }) => bgColor};
  color: ${({ theme }) => theme.content.weak};
`;
