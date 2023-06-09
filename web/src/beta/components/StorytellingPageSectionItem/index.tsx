import styled from "@emotion/styled";
import { FC } from "react";

import Icon from "../Icon";

type Props = {
  icon: string;
  title: string;
  index: number;
  active?: boolean;
  onAction?: () => void;
  onClick?: () => void;
};

const StorytellingPageSectionItem: FC<Props> = ({
  icon,
  title,
  index,
  active,
  onAction,
  onClick,
}) => {
  return (
    <HorizontalBox>
      <VerticalBox>
        <IndexText>{index}</IndexText>
        <Icon icon={icon} />
      </VerticalBox>
      <TitleArea active={active}>
        <TitleText onClick={onClick}>{title}</TitleText>
        <Icon icon={"actionbutton"} onClick={onAction} />
      </TitleArea>
    </HorizontalBox>
  );
};

const HorizontalBox = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 0px;
  gap: 4px;
`;

const VerticalBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 4px;
`;

const IndexText = styled.text`
  font-family: "Noto Sans";
  font-weight: 400;
  font-size: 14px;

  color: #c7c5c5;
`;

const TitleArea = styled.div<{ active?: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  padding: 8px;
  gap: 4px;

  background: ${({ active }) => (active ? "#3b3cd0" : "#232226")};
  border: ${({ active }) => (active ? "1px solid #3b3cd0" : "1px solid #3f3d45")};
  border-radius: 6px;

  width: 100%;
  min-height: 56px;
`;

const TitleText = styled.text`
  font-family: "Noto Sans JP";
  font-weight: 400;
  font-size: 12px;
  color: #ffffff;
`;

export default StorytellingPageSectionItem;
