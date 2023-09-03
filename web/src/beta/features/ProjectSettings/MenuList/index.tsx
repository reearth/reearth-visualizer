import { Link } from "react-router-dom";

import Text from "@reearth/beta/components/Text";
import { styled, useTheme } from "@reearth/services/theme";

export const MenuItem: React.FC<{
  text?: string;
  linkTo?: string;
  onClick?: () => void;
  color?: string;
  active?: boolean;
}> = ({ text, linkTo, onClick, color, active }) => {
  const theme = useTheme();
  const content = (
    <MenuItemWrapper onClick={onClick} active={active}>
      <Text size="body" color={color || theme.content.strong}>
        {text}
      </Text>
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
  transition: all 0.3s ease;
  &:hover {
    background-color: ${({ active, theme }) => (active ? theme.select.main : theme.bg[2])};
  }
`;

const StyledLinkButton = styled(Link)`
  text-decoration: none;
  width: 100%;

  :hover {
    text-decoration: none;
  }
`;
