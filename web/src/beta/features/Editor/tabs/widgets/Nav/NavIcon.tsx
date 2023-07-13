import Icon from "@reearth/beta/components/Icon";
import { styled } from "@reearth/services/theme";

export const NavIcon = styled(Icon)<{ toggled?: boolean }>`
  padding: 12px;
  border-radius: 4px;
  ${({ theme, toggled }) =>
    toggled
      ? `
  color: ${theme.general.content.strong};
  background: ${theme.general.select}80;
  `
      : `color: ${theme.general.content.weak};`}

  :hover {
    color: ${({ theme }) => theme.general.content.strong};
    background: ${({ theme }) => theme.general.select}80;
    cursor: pointer;
  }
`;
