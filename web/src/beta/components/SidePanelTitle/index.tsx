import type { FC } from "react";

import { styled } from "@reearth/services/theme";

export type Props = {
  title: string;
  fontSize?: string | number;
};

const SidePanelTitle: FC<Props> = ({ title, fontSize }) => {
  return (
    <StyledDiv>
      <StyledText fontSize={fontSize}>{title}</StyledText>
    </StyledDiv>
  );
};

const StyledDiv = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 8px;
  gap: 166px;

  width: 286px;
  height: 32px;

  background: #3f3d45;

  flex: none;
  order: 0;
  align-self: stretch;
  flex-grow: 0;

  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
`;

const StyledText = styled.text`
  height: 16px;

  font-family: "Noto Sans";
  font-style: normal;
  font-weight: 500;
  font-size: ${({ fontSize }) => (fontSize ? fontSize : "16px")};
  line-height: 16px;

  color: #ffffff;

  flex: none;
  order: 0;
  flex-grow: 0;
`;

export default SidePanelTitle;
