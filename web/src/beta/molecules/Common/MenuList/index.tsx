import { Link } from "react-router-dom";

import Icon from "@reearth/classic/components/atoms/Icon";
import Text from "@reearth/classic/components/atoms/Text";
import { styled, useTheme } from "@reearth/services/theme";

export const MenuListItemLabel: React.FC<{
  icon?: string;
  text?: string;
  linkTo?: string;
  onClick?: () => void;
  disabled?: boolean;
  color?: string;
  center?: boolean;
}> = ({ icon, text, linkTo, onClick, disabled, color, center }) => {
  const theme = useTheme();
  const content = (
    <MenuItemWrapper
      color={(disabled && theme.classic.properties.text) || color || theme.classic.main.text}
      onClick={onClick}
      disabled={disabled}>
      {icon ? <StyledIcon icon={icon} size={20} color={color} disabled={disabled} /> : null}
      <StyledLabel size="m" center={center}>
        {text}
      </StyledLabel>
    </MenuItemWrapper>
  );

  return typeof linkTo !== "string" ? (
    content
  ) : (
    <StyledLinkButton
      style={{
        color: (disabled && theme.classic.properties.text) || color || theme.classic.main.text,
      }}
      to={linkTo}>
      {content}
    </StyledLinkButton>
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
      background-color: ${props.theme.classic.main.bg};
    `}
  }
`;

const MenuItemWrapper = styled.div<{ disabled?: boolean }>`
  flex: auto;
  display: flex;
  padding: 0 16px;
  align-items: center;
  min-height: 52px;
  cursor: pointer;
  height: 100%;
  pointer-events: ${({ disabled }) => (disabled ? "none" : "auto")};
`;

const StyledLabel = styled(Text)<{ center?: boolean }>`
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
  color: ${({ disabled, color, theme }) =>
    disabled ? theme.classic.properties.text : color ? color : theme.classic.main.text};
`;
