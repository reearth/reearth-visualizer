import { FC } from "react";

import { styled } from "@reearth/services/theme";

type Props = {};

const StoryPanel: FC<Props> = () => {
  return <Wrapper>StoryPanel</Wrapper>;
};

export default StoryPanel;

const Wrapper = styled.div`
  box-sizing: border-box;
  width: 462px;
  padding: 10px 24px;
  background-color: #f1f1f1;
`;
