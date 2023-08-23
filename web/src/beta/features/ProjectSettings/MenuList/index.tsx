import { Link } from "react-router-dom";

import Text from "@reearth/beta/components/Text";
import { styled, useTheme } from "@reearth/services/theme";

export const MenuListItemLabel: React.FC<{
  text?: string;
  linkTo?: string;
  onClick?: () => void;
  color?: string;
  active?: boolean;
}> = ({ text, linkTo, onClick, color, active }) => {
  const theme = useTheme();
  const content = (
    <MenuItemWrapper onClick={onClick} active={active}>
      <StyledLabel size="body" color={color || theme.content.strong}>
        {text}
      </StyledLabel>
    </MenuItemWrapper>
  );

  return !linkTo ? content : <StyledLinkButton to={linkTo}>{content}</StyledLinkButton>;
};

export const MenuList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 12px 0;
  width: 200px;
`;

const MenuItemWrapper = styled.div<{ active?: boolean }>`
  display: flex;
  box-sizing: border-box;
  width: 100%;
  padding: 8px 16px;
  cursor: pointer;
  background-color: ${({ active, theme }) => (active ? theme.select.main : "")};
`;

const StyledLabel = styled(Text)`
  line-height: 22px;
`;

const StyledLinkButton = styled(Link)`
  text-decoration: none;
  width: 100%;

  :hover {
    text-decoration: none;
  }
`;
