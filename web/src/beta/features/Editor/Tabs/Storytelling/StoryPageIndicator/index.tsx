import { FC } from "react";

import { styled } from "@reearth/services/theme";

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
        const progress = isCurrentPage ? currentPageProgress : isActive ? 100 : 0;
        return (
          <Indicator key={i} progress={progress} type="button" onClick={() => onChangePage(page)} />
        );
      })}
    </Wrapper>
  );
};

export default StoryPageIndicator;

const Wrapper = styled.div`
  display: flex;
`;

// TODO: fix colors/transitions including hover
const Indicator = styled.button<{ progress: number }>`
  position: relative;
  flex: 1;
  height: 8px;
  background-color: #c2deff;
  transition: all 0.15s;

  :hover {
    opacity: 0.8;
  }

  :not(:first-child) {
    border-left: 1px solid #ffffff;
  }

  :after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: ${({ progress }) => progress}%;
    background-color: #3592ff;
    transition: width 0.15s;
  }
`;
