import { FC } from "react";

import { styled } from "@reearth/services/theme";

import useHooks, { type GQLStory, type GQLStoryPage } from "./hooks";
import PageIndicator from "./PageIndicator";
import StoryContent from "./PanelContent";

export const storyPanelWidth = 442;

export { type GQLStory, type GQLStoryPage } from "./hooks";

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
  sceneId?: string;
  selectedStory?: GQLStory;
  currentPage?: GQLStoryPage;
  isAutoScrolling?: boolean;
  installableBlocks?: InstallableStoryBlock[];
  onAutoScrollingChange?: (isScrolling: boolean) => void;
  onCurrentPageChange?: (id: string, disableScrollIntoView?: boolean) => void;
};

export const StoryPanel: FC<StoryPanelProps> = ({
  sceneId,
  selectedStory,
  currentPage,
  isAutoScrolling,
  installableBlocks,
  onAutoScrollingChange,
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
        sceneId={sceneId}
        storyId={selectedStory?.id}
        pages={selectedStory?.pages}
        selectedPageId={selectedPageId}
        installableStoryBlocks={installableBlocks}
        selectedStoryBlockId={selectedBlockId}
        showPageSettings={showPageSettings}
        showingIndicator={!!pageInfo}
        isAutoScrolling={isAutoScrolling}
        onAutoScrollingChange={onAutoScrollingChange}
        onPageSettingsToggle={handlePageSettingsToggle}
        onPageSelect={handlePageSelect}
        onBlockSelect={handleBlockSelect}
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
