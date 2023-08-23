import { FC } from "react";

import { styled, useTheme } from "@reearth/services/theme";

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
  const theme = useTheme();
  return (
    <HorizontalBox>
      <VerticalBox>
        <Text size={"body"}>{index}</Text>
        <Icon icon={icon} />
      </VerticalBox>
      <TitleArea active={active}>
        <Text
          onClick={onClick}
          size="footnote"
          color={theme.content.withBackground}
          otherProperties={{ wordBreak: "break-all" }}>
          {title}
        </Text>
        <Wrapper>
          <Icon icon="actionbutton" onClick={onAction} />
        </Wrapper>
      </TitleArea>
    </HorizontalBox>
  );
};

const HorizontalBox = styled.div`
  display: flex;
  min-height: 56px;
  gap: 4px;
  cursor: pointer;
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

  background: ${props => (props.active ? props.theme.select.main : props.theme.bg[2])};
  border: 1px solid ${props => (props.active ? props.theme.select.main : props.theme.bg[4])};
  border-radius: 6px;

  width: 100%;
`;

const Wrapper = styled.div`
  height: 100%;
`;

export default StorytellingPageSectionItem;
