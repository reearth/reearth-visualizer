import { useState } from "react";

import fonts from "@reearth/classic/theme/reearthTheme/common/fonts";
import { styled } from "@reearth/services/theme";

type Props = {
  inactive?: boolean;
  selected?: boolean;
  label?: string;
  onChange?: () => void;
};

export default function RadioBox({ inactive, selected, label, onChange }: Props) {
  const [isChecked, setIsChecked] = useState(selected ?? false);

  const handleRadioChange = () => {
    setIsChecked(!isChecked);
    if (!onChange) return;
    onchange;
  };

  return (
    <Radio selected={isChecked} inactive={inactive}>
      <RadioInput type="radio" checked={isChecked} onChange={handleRadioChange} />
      <RadioButton selected={isChecked} inactive={inactive}>
        {isChecked && <Checkmark selected={isChecked} inactive={inactive} />}
      </RadioButton>
      <RadioText>{label}</RadioText>
    </Radio>
  );
}

const Checkmark = styled.div<Props>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: white;
  background-color: ${({ selected, inactive, theme }) =>
    selected ? theme.select.main : inactive ? theme.content.weaker : theme.content.main};
`;

const Radio = styled.label<Props>`
  display: flex;
  align-items: center;
  min-width: 30px;
  min-height: 30px;
  list-style: none;
  padding: 6px;
  font-size: ${fonts.sizes.m}px;
  background: ${({ selected, theme }) => (selected ? theme.bg[1] : "none")};
  cursor: pointer;
  box-sizing: border-box;
  border-radius: 2px;
  :not(:last-child) {
    margin-right: 1px;
  }
`;

const RadioInput = styled.input`
  opacity: 0;
  position: absolute;
`;

const RadioButton = styled.span<Props>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid
    ${({ selected, inactive, theme }) =>
      selected ? theme.select.main : inactive ? theme.content.weaker : theme.content.main};
  margin-right: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const RadioText = styled.span`
  flex-grow: 1;
`;
