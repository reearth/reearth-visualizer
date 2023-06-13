import { FC } from "react";

import { styled } from "@reearth/services/theme";

import Icon from "../Icon";
import Text from "../Text";

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
        <Text size={"m"} color="#c7c5c5">
          {index}
        </Text>
        <Icon icon={icon} />
      </VerticalBox>
      <TitleArea active={active}>
        <Text onClick={onClick} size={"s"} color="#ffffff" otherProperties={{ cursor: "pointer" }}>
          {title}
        </Text>
        <Icon icon="actionbutton" onClick={onAction} style={{ cursor: "pointer" }} />
      </TitleArea>
    </HorizontalBox>
  );
};

const HorizontalBox = styled.div`
  display: flex;
  gap: 4px;
`;

const VerticalBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
`;

const TitleArea = styled.div<{ active?: boolean }>`
  display: flex;
  justify-content: space-between;
  padding: 8px;
  gap: 4px;

  background: ${props => (props.active ? props.theme.main.select : props.theme.main.bg)};
  border: 1px solid ${props => (props.active ? props.theme.main.select : props.theme.main.border)};
  border-radius: 6px;

  width: 100%;
  min-height: 56px;
`;

export default StorytellingPageSectionItem;
