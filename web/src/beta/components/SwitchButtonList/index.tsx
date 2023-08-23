import Text from "@reearth/beta/components/Text";
import { SwitchField } from "@reearth/beta/hooks/useManageSwitchState/hooks";
import { styled, useTheme } from "@reearth/services/theme";

type AdditionalField = {
  text: string;
};
type SwitchAdditionalField = SwitchField<AdditionalField>;

export type Props = {
  list: SwitchAdditionalField[];
  onChange?: (id: string) => void;
};
const SwitchButtonList: React.FC<Props> = ({ list, onChange }) => {
  const theme = useTheme();
  return (
    <>
      {list.map((item, index) => (
        <SwitchButton
          key={index}
          disabled={!!item?.active}
          onClick={() => onChange?.(item.id)}
          first={index === 0}
          end={index === list.length - 1}>
          <Text
            size="footnote"
            color={item.active ? theme.content.withBackground : theme.content.main}>
            {item.text}
          </Text>
        </SwitchButton>
      ))}
    </>
  );
};
const SwitchButton = styled.button<{
  disabled: boolean;
  first: boolean;
  end: boolean;
}>`
  background: ${props => (props.disabled ? props.theme.select.main : props.theme.bg[0])};
  padding: 8px;
  height: 32px;
  border-top-left-radius: ${props => (props.first ? "4px" : "0px")};
  border-top-right-radius: ${props => (props.end ? "4px" : "0px")};
  border-bottom-left-radius: ${props => (props.first ? "4px" : "0px")};
  border-bottom-right-radius: ${props => (props.end ? "4px" : "0px")};
  transition: all 0.5s ease;
  :hover {
    background: ${props => props.theme.select.main};
  }
`;

export default SwitchButtonList;
