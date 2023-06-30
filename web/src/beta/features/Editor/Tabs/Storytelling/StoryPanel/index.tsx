import { FC } from "react";

import StoryPageIndicator from "@reearth/beta/features/Editor/Tabs/Storytelling/StoryPageIndicator";
import { styled } from "@reearth/services/theme";

type Props = {};

export const StoryPanel: FC<Props> = () => {
  return (
    <Wrapper>
      <IndicatorWrapper>
        <StoryPageIndicator
          currentPage={3}
          currentPageProgress={33}
          maxPage={6}
          onChangePage={page => console.log(page)}
        />
      </IndicatorWrapper>
      <div>StoryPanel</div>
    </Wrapper>
  );
};

export default StoryPanel;

const Wrapper = styled.div`
  position: relative;
  box-sizing: border-box;
  width: 462px;
  padding: 10px 24px;
  background-color: ${({ theme }) => theme.colors.scrollBar.bg.light};
`;

const IndicatorWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
`;
