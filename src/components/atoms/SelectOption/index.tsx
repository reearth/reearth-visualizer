import { styled } from "@reearth/theme";
import fonts from "@reearth/theme/fonts";

export type Props = {
  label: string;
  focused?: boolean;
};

const Option = styled.li<Props>`
  display: flex;
  list-style: none;
  padding: 6px;
  font-size: ${fonts.sizes.xs}px;
  color: ${({ theme }) => theme.properties.contentsText};
  background: ${({ focused, theme }) =>
    focused ? theme.selectList.option.hoverBg : "transparent"};
  cursor: pointer;
`;

export default Option;
