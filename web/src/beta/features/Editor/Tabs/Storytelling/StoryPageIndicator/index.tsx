import { FC } from "react";

import { styled } from "@reearth/services/theme";

import StoryPageIndicatorItem from "./StoryPageIndicatorItem";

type Props = {
  currentPage: number;
  currentPageProgress: number;
  maxPage: number;
  onChangePage: (page: number) => void;
};

const StoryPageIndicator: FC<Props> = ({
  currentPage,
  currentPageProgress,
  maxPage,
  onChangePage,
}) => {
  return (
    <Wrapper>
      {Array.from({ length: maxPage }).map((_, i) => {
        const page = i + 1;
        const isActive = currentPage >= page;
        const isCurrentPage = page === currentPage;

        return (
          <StoryPageIndicatorItem
            key={i}
            page={page}
            progress={isCurrentPage ? currentPageProgress : isActive ? 100 : 0}
            onChangePage={onChangePage}
          />
        );
      })}
    </Wrapper>
  );
};

export default StoryPageIndicator;

const Wrapper = styled.div`
  display: flex;
`;
