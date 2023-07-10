import { FC } from "react";

import StoryPageIndicator from "@reearth/beta/features/Editor/tabs/story/PageIndicator";
import { styled } from "@reearth/services/theme";

type Props = {};

export const StoryPanel: FC<Props> = () => {
  return (
    <Wrapper>
      <StoryPageIndicator
        currentPage={3}
        currentPageProgress={33}
        maxPage={6}
        onPageChange={page => console.log(page)}
      />
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
