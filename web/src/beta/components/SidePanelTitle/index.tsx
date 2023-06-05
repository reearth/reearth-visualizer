import type { FC } from "react";

import { styled } from "@reearth/services/theme";

export type Props = {
  title: string;
};

const SidePanelTitle: FC<Props> = ({ title }) => {
  return (
    <StyledDiv>
      <StyledText>{title}</StyledText>
    </StyledDiv>
  );
};

const StyledDiv = styled.div`
  padding: 8px;
  width: 100%;
  background: #3f3d45;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
`;

const StyledText = styled.text`
  font-size: 12px;
  line-height: 16px;
  color: #ffffff;
`;

export default SidePanelTitle;
