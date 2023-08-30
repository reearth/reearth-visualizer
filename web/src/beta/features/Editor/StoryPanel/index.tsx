import { FC, Fragment } from "react";

import PageIndicator from "@reearth/beta/features/Editor/StoryPanel/PageIndicator";
import { convert } from "@reearth/services/api/propertyApi/utils";
import { styled } from "@reearth/services/theme";

import useHooks, {
  pageElementId,
  type StoryFragmentFragment,
  type StoryPageFragmentFragment,
} from "./hooks";
import StoryPage from "./Page";
import SelectableArea from "./SelectableArea";

export const storyPanelWidth = 442;

type Props = {
  sceneId?: string;
  selectedStory?: StoryFragmentFragment;
  selectedPage?: StoryPageFragmentFragment;
  onPageSelect: (id: string) => void;
};

export const StoryPanel: FC<Props> = ({ sceneId, selectedStory, selectedPage, onPageSelect }) => {
  const {
    pageInfo,
    pageHeight,
    installableStoryBlocks,
    selectedStoryBlockId,
    showPageSettings,
    setPageSettingsShow,
    handlePageSettingsToggle,
    handleStoryBlockSelect,
  } = useHooks({
    sceneId,
    selectedStory,
    selectedPage,
    onPageSelect,
  });

  return (
    <Wrapper>
      {!!pageInfo && (
        <PageIndicator
          currentPage={pageInfo.currentPage}
          maxPage={pageInfo.maxPage}
          onPageChange={pageInfo.onPageChange}
        />
      )}
      <PageWrapper id={pageElementId} showingIndicator={!!pageInfo}>
        {selectedStory?.pages.map(p => (
          <Fragment key={p.id}>
            <SelectableArea
              title={p.title}
              position="left-bottom"
              icon="storyPage"
              noBorder
              isSelected={showPageSettings === p.id}
              onClick={() => handlePageSettingsToggle(p.id)}
              onSettingsToggle={() => setPageSettingsShow(p.id)}>
              <StoryPage
                sceneId={sceneId}
                storyId={selectedStory.id}
                pageId={p.id}
                propertyId={p.property?.id}
                propertyItems={convert(p.property)}
                installableStoryBlocks={installableStoryBlocks}
                selectedStoryBlockId={selectedStoryBlockId}
                onBlockSelect={handleStoryBlockSelect}
              />
              <PageGap height={pageHeight} />
            </SelectableArea>
          </Fragment>
        ))}
      </PageWrapper>
    </Wrapper>
  );
};

export default StoryPanel;

const Wrapper = styled.div`
  flex: 0 0 ${storyPanelWidth}px;
  background: #f1f1f1;
  color: ${({ theme }) => theme.content.weak};
`;

const PageWrapper = styled.div<{ showingIndicator?: boolean }>`
  height: ${({ showingIndicator }) => (showingIndicator ? "calc(100% - 8px)" : "100%")};
  overflow-y: auto;
  cursor: pointer;
`;

const PageGap = styled.div<{ height?: number }>`
  height: ${({ height }) => (height ? height + "px" : "70vh")};
`;
