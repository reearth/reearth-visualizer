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
      <PageWrapper id={pageElementId} onClick={() => console.log("page clicked")}>
        {selectedStory?.pages.map(p => (
          <Fragment key={p.id}>
            <SelectableArea title={p.title} isSelected position="left" icon="storyPage" noBorder>
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

const PageWrapper = styled.div`
  height: calc(100% - 8px);
  overflow-y: auto;

  :hover {
    cursor: help;
  }
`;

const PageGap = styled.div<{ height?: number }>`
  height: ${({ height }) => (height ? height + "px" : "70vh")};
`;
