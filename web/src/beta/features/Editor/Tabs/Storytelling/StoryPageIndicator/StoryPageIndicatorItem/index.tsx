import styled from "@emotion/styled";
import { FC, memo } from "react";

type Props = {
  page: number;
  progress: number;
  onChangePage: (page: number) => void;
};
const StoryPageIndicatorItem: FC<Props> = memo(({ progress, page, onChangePage }) => {
  return <Indicator progress={progress} type="button" onClick={() => onChangePage(page)} />;
});
StoryPageIndicatorItem.displayName = "StoryPageIndicatorItem";

export default memo(StoryPageIndicatorItem);

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

  :not(:first-of-type) {
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
