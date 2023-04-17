import React from "react";

import Icon from "@reearth/components/atoms/Icon";
import Text from "@reearth/components/atoms/Text";
import { styled, useTheme } from "@reearth/theme";

interface Props {
  id: string;
  icon?: string;
  iconSize?: string;
  text?: string;
  subtext?: string;
  margin?: number;
  border?: "solid" | "dotted" | "dashed" | "double" | "none";
  borderColor?: string;
  onClick?: (id: string) => void;
}

const Card: React.FC<Props> = ({
  id,
  icon,
  iconSize,
  text,
  subtext,
  margin,
  border,
  borderColor,
  onClick,
}) => {
  const theme = useTheme();
  return (
    <StyledContainer
      border={border}
      borderColor={borderColor}
      icon={icon}
      margin={margin}
      onClick={onClick && (() => onClick(id))}>
      <Content>
        <Icon icon={icon} size={iconSize} color={theme.main.text} />
        <Text size="xs">{text}</Text>
        <Text size="2xs" color={theme.main.text}>
          {subtext}
        </Text>
      </Content>
    </StyledContainer>
  );
};

const StyledContainer = styled.div<{
  border?: string;
  icon?: string;
  margin?: number;
  borderColor?: string;
}>`
  height: 192px;
  width: 193px;
  margin: ${props => props.margin}px;
  background-color: ${({ theme }) => theme.main.lighterBg};
  border: 1px ${props => props.border || "solid"}
    ${props => (props.borderColor ? props.borderColor : props.theme.assetCard.highlight)};
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  flex-direction: column;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  * {
    margin-bottom: 10px;
  }
`;

export default Card;
