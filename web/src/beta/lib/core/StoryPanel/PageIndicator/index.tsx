import { FC, useMemo } from "react";

import { styled } from "@reearth/services/theme";

type Props = {
  currentPage: number;
  maxPage: number;
  onPageChange: (page: number) => void;
};

const StoryPageIndicator: FC<Props> = ({ currentPage, maxPage, onPageChange }) => {
  const widthPercentage = useMemo(() => {
    const onePageWidth = 100 / maxPage;
    const base = currentPage * onePageWidth;
    return base;
  }, [currentPage, maxPage]);

  return (
    <Wrapper widthPercentage={widthPercentage}>
      {[...Array(maxPage)].map((_, i) => {
        return <Indicator key={i} type="button" onClick={() => onPageChange(i + 1)} />;
      })}
    </Wrapper>
  );
};

export default StoryPageIndicator;

const Wrapper = styled.div<{ widthPercentage: number }>`
  position: relative;
  display: flex;
  background-color: #78a9ff;
  z-index: ${({ theme }) => theme.zIndexes.visualizer.storyPage.indicator.unselected};

  :after {
    content: "";
    position: absolute;
    inset: 0;
    background-color: #4589ff;
    transition: width 0.2s ease-out;
    width: ${({ widthPercentage }) => widthPercentage}%;
  }
`;

const Indicator = styled.button`
  position: relative;
  flex: 1;
  height: 8px;
  z-index: ${({ theme }) => theme.zIndexes.visualizer.storyPage.indicator.selected};

  :not(:first-of-type) {
    border-left: 1px solid #ffffff;
  }
`;
