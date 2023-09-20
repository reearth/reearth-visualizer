import { FC } from "react";

import { ValueType, ValueTypes } from "@reearth/beta/utils/value";
import { InstalledStoryBlock } from "@reearth/services/api/storytellingApi/blocks";
import { styled } from "@reearth/services/theme";

import useHooks, { type Story, type Page } from "./hooks";
import PageIndicator from "./PageIndicator";
import StoryContent from "./PanelContent";

export const storyPanelWidth = 442;

export { type Story, type Page } from "./hooks";

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
  currentPage?: Page;
  isEditable?: boolean;
  isAutoScrolling?: boolean;
  installableBlocks?: InstallableStoryBlock[];
  installedBlocks?: InstalledStoryBlock[];
  onAutoScrollingChange: (isScrolling: boolean) => void;
  onBlockCreate?: (index?: number) => (extensionId?: string, pluginId?: string) => Promise<void>;
  onBlockDelete?: (blockId?: string) => Promise<void>;
  onPropertyUpdate?: (
    propertyId?: string,
    schemaItemId?: string,
    fieldId?: string,
    itemId?: string,
    vt?: ValueType,
    v?: ValueTypes[ValueType],
  ) => Promise<void>;
  onCurrentPageChange: (id: string, disableScrollIntoView?: boolean) => void;
};

export const StoryPanel: FC<StoryPanelProps> = ({
  selectedStory,
  currentPage,
  isEditable,
  isAutoScrolling,
  installableBlocks,
  installedBlocks,
  onAutoScrollingChange,
  onBlockCreate,
  onBlockDelete,
  onPropertyUpdate,
  onCurrentPageChange,
}) => {
  const {
    pageInfo,
    selectedPageId,
    selectedBlockId,
    showPageSettings,
    handlePageSettingsToggle,
    handlePageSelect,
    handleBlockSelect,
    handleCurrentPageChange,
  } = useHooks({
    selectedStory,
    currentPage,
    isEditable,
    onCurrentPageChange,
  });

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
        selectedPageId={selectedPageId}
        installableStoryBlocks={installableBlocks}
        installedStoryBlocks={installedBlocks}
        selectedStoryBlockId={selectedBlockId}
        showPageSettings={showPageSettings}
        showingIndicator={!!pageInfo}
        isAutoScrolling={isAutoScrolling}
        isEditable={isEditable}
        onAutoScrollingChange={onAutoScrollingChange}
        onPageSettingsToggle={handlePageSettingsToggle}
        onPageSelect={handlePageSelect}
        onBlockCreate={onBlockCreate}
        onBlockDelete={onBlockDelete}
        onBlockSelect={handleBlockSelect}
        onPropertyUpdate={onPropertyUpdate}
        onCurrentPageChange={handleCurrentPageChange}
      />
    </PanelWrapper>
  );
};

export default StoryPanel;

const PanelWrapper = styled.div`
  flex: 0 0 ${storyPanelWidth}px;
  background: #f1f1f1;
  color: ${({ theme }) => theme.content.weak};
`;
