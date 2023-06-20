import type { FC } from "react";

import { styled, useTheme } from "@reearth/services/theme";

import useManageSwitchState, { SwitchField } from "../../hooks/useManageSwitchState/hooks";
import Text from "../Text";

type CustomField = {
  name: string;
};
type SwitchCustomField = SwitchField<CustomField>;

export type Props = {
  items: SwitchCustomField[];
  onChange?: (id: string) => void;
};
const SubTabButtonList: FC<Props> = ({ items, onChange }) => {
  const theme = useTheme();
  const { handleActivate, fields } = useManageSwitchState({ fields: items });
  const handleClick = (id: string) => {
    handleActivate(id);
    onChange?.(id);
  };
  return (
    <>
      {fields.map((item, index) => (
        <SubTabButton
          key={index}
          disabled={item.active || false}
          onClick={() => handleClick(item.id)}>
          <Text size="footnote" color={theme.general.content.main}>
            {item.name}
          </Text>
        </SubTabButton>
      ))}
    </>
  );
};

const SubTabButton = styled.button<{ disabled: boolean }>`
  background: ${({ disabled, theme }) => (disabled ? theme.general.select : "inherit")};
  padding: 8px;
  height: 32px;
  border-radius: 4px 4px 0px 0px;
  :hover {
    background: ${({ theme }) => theme.general.select};
    transition: all 0.5s ease;
  }
  text-align: center;
`;

export default SubTabButtonList;
