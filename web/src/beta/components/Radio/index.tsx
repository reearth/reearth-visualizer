import fonts from "@reearth/classic/theme/reearthTheme/common/fonts";
import { styled } from "@reearth/services/theme";

type Props = {
  linked?: boolean;
  overridden?: boolean;
  inactive?: boolean;
  selected?: boolean;
};

const Radio = styled.li<Props>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 30px;
  min-height: 30px;
  list-style: none;
  padding: 6px;
  font-size: ${fonts.sizes.m}px;
  color: ${({ selected, inactive, theme }) =>
    selected ? theme.select.main : inactive ? theme.select.weaker : theme.content.main};
  background: ${({ selected, theme }) => (selected ? theme.bg[1] : "none")};
  cursor: pointer;
  box-sizing: border-box;
  border-radius: 2px;
  :not(:last-child) {
    margin-right: 1px;
  }
`;

export default Radio;
