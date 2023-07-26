import { FC, useMemo } from "react";

import PageIndicator from "@reearth/beta/features/Editor/tabs/story/PageIndicator";
import { StoryFragmentFragment, StoryPageFragmentFragment } from "@reearth/services/gql";
import { styled } from "@reearth/services/theme";

type Props = {
  selectedStory?: StoryFragmentFragment;
  selectedPage?: StoryPageFragmentFragment;
  onPageSelect: (id: string) => void;
};

export const StoryPanel: FC<Props> = ({ selectedStory, selectedPage, onPageSelect }) => {
  const pageInfo = useMemo(() => {
    const pages = selectedStory?.pages ?? [];
    const currentIndex = pages.findIndex(p => p.id === selectedPage?.id);
    return {
      pages,
      currentPage: currentIndex + 1,
      maxPage: pages.length,
      onPageChange: (page: number) => onPageSelect(pages[page - 1]?.id),
    };
  }, [onPageSelect, selectedPage, selectedStory]);
  return (
    <Wrapper>
      {!!selectedStory?.pages?.length && (
        <PageIndicator
          currentPage={pageInfo.currentPage}
          currentPageProgress={1}
          onPageChange={pageInfo.onPageChange}
          maxPage={pageInfo.maxPage}
        />
      )}
      <Content>
        <div>StoryPanel</div>
      </Content>
    </Wrapper>
  );
};

export default StoryPanel;

const Wrapper = styled.div`
  width: 462px;
  background-color: #f1f1f1;
`;

const Content = styled.div`
  padding: 10px 24px;
`;
