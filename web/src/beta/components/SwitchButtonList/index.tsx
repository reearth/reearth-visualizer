import type { FC } from "react";

import { styled, useTheme, PublishTheme } from "@reearth/services/theme";

import useManageSwitchState, { SwitchField } from "../../hooks/useManageSwitchState/hooks";
import Text from "../Text";

type AdditionalField = {
  text: string;
};
type SwitchAdditionalField = SwitchField<AdditionalField>;

export type Props = {
  publishedTheme?: PublishTheme;
  list: SwitchAdditionalField[];
  onChange?: (id: string) => void;
};
const SwitchButtonList: FC<Props> = ({ publishedTheme, list, onChange }) => {
  const theme = useTheme();
  const { handleActivate, fields } = useManageSwitchState({ fields: list });
  const handleClick = (id: string) => {
    handleActivate(id);
    onChange?.(id);
  };
  return (
    <>
      {fields.map((item, index) => (
        <SwitchButton
          key={index}
          disabled={item.active || false}
          onClick={() => handleClick(item.id)}
          first={index === 0}
          end={index === fields.length - 1}>
          <Text size="xs" color={publishedTheme?.mainText || theme.main.text}>
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
  background: ${props => (props.disabled ? props.theme.main.select : "inherit")};
  padding: 8px;
  height: 32px;
  border-radius: ${props =>
    props.first ? "4px 0px 0px 4px" : props.end ? "0px 4px 4px 0px" : "0px"};
  :hover {
    background: ${props => props.theme.main.select};
    transition: all 0.5s ease;
  }
`;

export default SwitchButtonList;
