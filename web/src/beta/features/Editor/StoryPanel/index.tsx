import { FC, Fragment } from "react";

import PageIndicator from "@reearth/beta/features/Editor/tabs/story/PageIndicator";
import { StoryFragmentFragment, StoryPageFragmentFragment } from "@reearth/services/gql";
import { styled } from "@reearth/services/theme";

import useHooks, { pageElementId } from "./hooks";
import StoryPage from "./Page";

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
      <PageWrapper id={pageElementId}>
        {selectedStory?.pages.map(p => (
          <Fragment key={p.id}>
            <StoryPage
              sceneId={sceneId}
              storyId={selectedStory.id}
              pageId={p.id}
              pageTitle={p.title}
              installableStoryBlocks={installableStoryBlocks}
              selectedStoryBlockId={selectedStoryBlockId}
              onBlockSelect={handleStoryBlockSelect}
            />
            <PageGap height={pageHeight} />
          </Fragment>
        ))}
      </PageWrapper>
    </Wrapper>
  );
};

export default StoryPanel;

const Wrapper = styled.div`
  width: ${storyPanelWidth}px;
  background: #f1f1f1;
  color: ${({ theme }) => theme.content.weak};
`;

const PageWrapper = styled.div`
  height: calc(100% - 8px);
  padding: 20px;
  box-sizing: border-box;
  overflow-y: auto;
  width: 442px;
`;

const PageGap = styled.div<{ height?: number }>`
  height: ${({ height }) => (height ? height + "px" : "70vh")};
`;
