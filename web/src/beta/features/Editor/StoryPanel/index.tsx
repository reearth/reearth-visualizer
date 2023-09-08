import { FC } from "react";

import PageIndicator from "@reearth/beta/features/Editor/StoryPanel/PageIndicator";
import { styled } from "@reearth/services/theme";

import useHooks, { type StoryFragmentFragment, type StoryPageFragmentFragment } from "./hooks";
import StoryContent from "./PanelContent";

export const storyPanelWidth = 442;

export type Props = {
  sceneId?: string;
  selectedStory?: StoryFragmentFragment;
  currentPage?: StoryPageFragmentFragment;
  onCurrentPageChange: (id: string, disableScrollIntoView?: boolean) => void;
};

export const StoryPanel: FC<Props> = ({
  sceneId,
  selectedStory,
  currentPage,
  onCurrentPageChange,
}) => {
  const {
    pageInfo,
    installableBlocks,
    selectedPageId,
    selectedBlockId,
    showPageSettings,
    handlePageSettingsToggle,
    handlePageSelect,
    handleBlockSelect,
    handleCurrentPageChange,
  } = useHooks({
    sceneId,
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
