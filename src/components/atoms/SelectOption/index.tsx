import { styled } from "@reearth/theme";
import colors from "@reearth/theme/colors";
import fonts from "@reearth/theme/fonts";

export type Props = {
  label: string;
  linked?: boolean;
  overridden?: boolean;
  inactive?: boolean;
  focused?: boolean;
  selected?: boolean;
};

const Option = styled.li<Props>`
  display: flex;
  list-style: none;
  padding: 6px;
  font-size: ${fonts.sizes.xs}px;
  color: ${({ linked, overridden, selected, inactive, theme }) =>
    selected && linked && overridden
      ? colors.primary.main
      : selected && linked
      ? colors.primary.main
      : selected && overridden
      ? colors.danger.main
      : selected
      ? theme.properties.contentsText
      : linked && overridden
      ? colors.danger.main
      : overridden
      ? colors.primary.main
      : inactive
      ? colors.outline.main
      : theme.properties.contentsText};
  background: ${({ focused, theme }) => (focused ? theme.colors.bg[4] : theme.colors.bg[2])};
  cursor: pointer;
`;

export default Option;
