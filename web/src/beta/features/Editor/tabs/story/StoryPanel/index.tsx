import { FC, useMemo } from "react";

import PageIndicator from "@reearth/beta/features/Editor/tabs/story/PageIndicator";
import { StoryFragmentFragment, StoryPageFragmentFragment } from "@reearth/services/gql";
import { styled } from "@reearth/services/theme";

import StoryPage from "./Page";

type Props = {
  selectedStory?: StoryFragmentFragment;
  selectedPage?: StoryPageFragmentFragment;
  onPageSelect: (id: string) => void;
};

export const StoryPanel: FC<Props> = ({ selectedStory, selectedPage, onPageSelect }) => {
  const pageInfo = useMemo(() => {
    const pages = selectedStory?.pages ?? [];
    if ((pages?.length ?? 0) < 2) return;

    const currentIndex = pages.findIndex(p => p.id === selectedPage?.id);
    return {
      currentPage: currentIndex + 1,
      maxPage: pages.length,
      onPageChange: (page: number) => onPageSelect(pages[page - 1]?.id),
    };
  }, [onPageSelect, selectedPage, selectedStory]);
  return (
    <Wrapper>
      {!!pageInfo && (
        <PageIndicator
          currentPage={pageInfo.currentPage}
          currentPageProgress={33}
          onPageChange={pageInfo.onPageChange}
          maxPage={pageInfo.maxPage}
        />
      )}
      <PageWrapper>
        {selectedStory?.pages.map(p => (
          <StoryPage key={p.id} content={p.id} />
        ))}
      </PageWrapper>
    </Wrapper>
  );
};

export default StoryPanel;

const Wrapper = styled.div`
  background-color: #f1f1f1;
  color: ${({ theme }) => theme.content.weak};
`;

const PageWrapper = styled.div`
  height: calc(100% - 8px);
  padding: 20px;
  box-sizing: border-box;
  overflow-y: auto;
  width: 442px;
`;
