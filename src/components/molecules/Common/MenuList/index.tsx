import React from "react";
import { Link } from "@reach/router";
import { styled } from "@reearth/theme";
import colors from "@reearth/theme/colors";
import Icon from "@reearth/components/atoms/Icon";
import Text from "@reearth/components/atoms/Text";

export const MenuListItemLabel: React.FC<{
  icon?: string;
  text?: string;
  linkTo?: string;
  onClick?: () => void;
  disabled?: boolean;
  color?: string;
  center?: boolean;
}> = ({ icon, text, linkTo, onClick, disabled, color, center }) => {
  const content = (
    <MenuItemWrapper
      size="m"
      color={(disabled && colors.text.weak) || color || colors.text.main}
      onClick={onClick}
      disabled={disabled}>
      {icon ? <StyledIcon icon={icon} size={20} color={color} disabled={disabled} /> : null}
      <StyledLabel center={center}>{text}</StyledLabel>
    </MenuItemWrapper>
  );

  return typeof linkTo !== "string" ? (
    content
  ) : (
    <StyledLinkButton to={linkTo}>{content}</StyledLinkButton>
  );
};

export const MenuList = styled.ul`
  list-style: none;
  padding-left: 0;
  margin: 0;
`;

export const MenuListItem = styled.li<{ noHover?: boolean }>`
  display: flex;
  &:hover {
    ${props =>
      !props.noHover &&
      `
      background-color: ${colors.bg[5]};
    `}
  }
`;

const MenuItemWrapper = styled(Text)<{ disabled?: boolean }>`
  flex: auto;
  display: flex;
  padding: 0 16px;
  align-items: center;
  min-height: 52px;
  cursor: pointer;
  height: 100%;
  pointer-events: ${({ disabled }) => (disabled ? "none" : "auto")};
`;

const StyledLabel = styled.div<{ center?: boolean }>`
  flex: auto;
  text-align: ${({ center }) => (center ? "center" : "left")};
`;

const StyledLinkButton = styled(Link)`
  text-decoration: none;
  width: 100%;
  height: 51px;
  &:hover {
    text-decoration: none;
  }
`;

const StyledIcon = styled(Icon)<{ color?: string; disabled?: boolean }>`
  margin-right: 10px;
  color: ${({ disabled, color }) =>
    disabled ? colors.text.weak : color ? color : colors.text.main};
`;
