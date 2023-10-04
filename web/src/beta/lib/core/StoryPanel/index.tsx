import { ValueType, ValueTypes } from "@reearth/beta/utils/value";
import { styled } from "@reearth/services/theme";

import useHooks, { type Story } from "./hooks";
import PageIndicator from "./PageIndicator";
import StoryContent from "./PanelContent";

export const storyPanelWidth = 442;

export { type Story, type StoryPage } from "./hooks";

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
  currentPageId?: string;
  isEditable?: boolean;
  isAutoScrolling?: boolean;
  installableBlocks?: InstallableStoryBlock[];
  onAutoScrollingChange: (isScrolling: boolean) => void;
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
  onCurrentPageChange: (id: string, disableScrollIntoView?: boolean) => void;
  onStoryBlockMove: (id: string, targetId: number, blockId: string) => void;
};

export const StoryPanel: React.FC<StoryPanelProps> = ({
  selectedStory,
  currentPageId,
  isEditable,
  isAutoScrolling,
  installableBlocks,
  onAutoScrollingChange,
  onBlockCreate,
  onBlockDelete,
  onPropertyUpdate,
  onCurrentPageChange,
  onStoryBlockMove,
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
    currentPageId,
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
        onStoryBlockMove={onStoryBlockMove}
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
