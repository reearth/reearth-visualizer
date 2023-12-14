import { forwardRef, memo, Ref, useMemo } from "react";

import { ValueType, ValueTypes } from "@reearth/beta/utils/value";
import { styled } from "@reearth/services/theme";

import { STORY_PANEL_WIDTH } from "./constants";
import { PanelProvider } from "./context";
import useHooks, { type StoryPanelRef, type Story } from "./hooks";
import PageIndicator from "./PageIndicator";
import StoryContent from "./PanelContent";

export type { Story, StoryPage, StoryPanelRef } from "./hooks";

export type InstallableStoryBlock = {
  name: string;
  description?: string;
  pluginId: string;
  extensionId: string;
  icon?: string;
  singleOnly?: boolean;
  type?: "StoryBlock";
};

export type StoryPanelProps = {
  selectedStory?: Story;
  isEditable?: boolean;
  installableBlocks?: InstallableStoryBlock[];
  onCurrentPageChange?: (id?: string, disableScrollIntoView?: boolean) => void;
  onBlockCreate?: (
    pageId?: string | undefined,
    extensionId?: string | undefined,
    pluginId?: string | undefined,
    index?: number | undefined,
  ) => Promise<void>;
  onBlockMove?: (id: string, targetId: number, blockId: string) => void;
  onBlockDelete?: (pageId?: string | undefined, blockId?: string | undefined) => Promise<void>;
  onPropertyUpdate?: (
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
};

export const StoryPanel = memo(
  forwardRef<any, StoryPanelProps>(
    (
      {
        selectedStory,
        isEditable,
        installableBlocks,
        onCurrentPageChange,
        onBlockCreate,
        onBlockMove,
        onBlockDelete,
        onPropertyUpdate,
        onPropertyItemAdd,
        onPropertyItemMove,
        onPropertyItemDelete,
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
          onCurrentPageChange,
        },
        ref,
      );

      const panelContext = useMemo(
        () => ({
          layerOverride,
          pageIds: selectedStory?.pages.map(p => p.id),
          disableSelection,
          onSelectionDisable: handleSelectionDisable,
          onLayerOverride: handleLayerOverride,
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
        [
          layerOverride,
          selectedStory?.pages,
          disableSelection,
          handleSelectionDisable,
          setCurrentPageId,
          setLayerOverride,
          handleLayerOverride,
        ],
      );

      return (
        <PanelProvider value={panelContext}>
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
              installableStoryBlocks={installableBlocks}
              showPageSettings={showPageSettings}
              showingIndicator={!!pageInfo}
              isAutoScrolling={isAutoScrolling}
              isEditable={isEditable}
              onPageSettingsToggle={handlePageSettingsToggle}
              onPageSelect={handlePageSelect}
              onCurrentPageChange={handleCurrentPageChange}
              onBlockCreate={onBlockCreate}
              onBlockMove={onBlockMove}
              onBlockDelete={onBlockDelete}
              onBlockSelect={handleBlockSelect}
              onBlockDoubleClick={handleBlockDoubleClick}
              onPropertyUpdate={onPropertyUpdate}
              onPropertyItemAdd={onPropertyItemAdd}
              onPropertyItemMove={onPropertyItemMove}
              onPropertyItemDelete={onPropertyItemDelete}
            />
          </PanelWrapper>
        </PanelProvider>
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
