import { forwardRef, memo, Ref } from "react";

import { ValueType, ValueTypes } from "@reearth/beta/utils/value";
import { styled } from "@reearth/services/theme";

import { STORY_PANEL_WIDTH } from "./constants";
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
  onBlockCreate?: (
    pageId?: string | undefined,
    extensionId?: string | undefined,
    pluginId?: string | undefined,
    index?: number | undefined,
  ) => Promise<void>;
  onBlockDelete?: (pageId?: string | undefined, blockId?: string | undefined) => Promise<void>;
  onPropertyUpdate?: (
    propertyId?: string,
    schemaItemId?: string,
    fieldId?: string,
    itemId?: string,
    vt?: ValueType,
    v?: ValueTypes[ValueType],
  ) => Promise<void>;
  onCurrentPageChange?: (id: string, disableScrollIntoView?: boolean) => void;
  onStoryBlockMove?: (id: string, targetId: number, blockId: string) => void;
};

export const StoryPanel = memo(
  forwardRef<any, StoryPanelProps>(
    (
      {
        selectedStory,
        isEditable,
        installableBlocks,
        onBlockCreate,
        onBlockDelete,
        onPropertyUpdate,
        onCurrentPageChange,
        onStoryBlockMove,
      },
      ref: Ref<StoryPanelRef>,
    ) => {
      const {
        pageInfo,
        currentPageId,
        selectedPageId,
        selectedBlockId,
        showPageSettings,
        isAutoScrolling,
        handlePageSettingsToggle,
        handlePageSelect,
        handleBlockSelect,
        handleCurrentPageChange,
      } = useHooks(
        {
          selectedStory,
          isEditable,
          onCurrentPageChange,
        },
        ref,
      );

      return (
        <PanelWrapper>
          {!!pageInfo && (
            <PageIndicator
              currentPage={pageInfo.currentPage}
              maxPage={pageInfo.maxPage}
              onPageChange={pageInfo.onPageChange}
            />
          )}
          <StoryContent
            pages={selectedStory?.pages}
            currentPageId={currentPageId}
            selectedPageId={selectedPageId}
            installableStoryBlocks={installableBlocks}
            selectedStoryBlockId={selectedBlockId}
            showPageSettings={showPageSettings}
            showingIndicator={!!pageInfo}
            isAutoScrolling={isAutoScrolling}
            isEditable={isEditable}
            onPageSettingsToggle={handlePageSettingsToggle}
            onPageSelect={handlePageSelect}
            onBlockCreate={onBlockCreate}
            onBlockDelete={onBlockDelete}
            onBlockSelect={handleBlockSelect}
            onPropertyUpdate={onPropertyUpdate}
            onCurrentPageChange={handleCurrentPageChange}
            onStoryBlockMove={onStoryBlockMove}
          />
        </PanelWrapper>
      );
    },
  ),
);

export default StoryPanel;

const PanelWrapper = styled.div`
  flex: 0 0 ${STORY_PANEL_WIDTH}px;
  background: #f1f1f1;
  color: ${({ theme }) => theme.content.weak};
`;
