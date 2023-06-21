import fonts from "@reearth/classic/theme/reearthTheme/common/fonts";
import { styled } from "@reearth/services/theme";

type Props = {
  linked?: boolean;
  overridden?: boolean;
  inactive?: boolean;
  selected?: boolean;
};

const Check = styled.li<Props>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 30px;
  list-style: none;
  padding: 6px;
  margin-right: 2px;
  font-size: ${fonts.sizes.m}px;
  color: ${({ linked, overridden, selected, inactive, theme }) =>
    selected && linked
      ? theme.classic.main.accent
      : selected && overridden
      ? theme.classic.main.danger
      : inactive
      ? theme.classic.text.pale
      : theme.classic.properties.contentsText};
  background: ${({ selected, theme }) => (selected ? theme.classic.main.bg : "none")};
  cursor: pointer;
  box-sizing: border-box;
  border-radius: 2px;
`;

export default Check;
