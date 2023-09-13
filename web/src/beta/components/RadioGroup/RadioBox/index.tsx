import { useCallback, useState } from "react";

import { fonts, styled } from "@reearth/services/theme";

export type Props = {
  inactive?: boolean;
  selected?: boolean;
  keyValue: string;
  onClick?: (value: string) => void;
  label?: string;
};

const RadioBox: React.FC<Props> = ({ inactive, selected, keyValue, label, onClick }: Props) => {
  const [isChecked, setIsChecked] = useState(selected ?? false);

  const handleRadioClick = useCallback(
    (value: string) => {
      setIsChecked(!isChecked);
      if (onClick) onClick(value);
    },
    [isChecked, onClick],
  );

  return (
    <Radio selected={isChecked} inactive={inactive}>
      <RadioInput
        type="radio"
        value={inactive ? undefined : keyValue}
        onClick={() => handleRadioClick(keyValue)}
      />
      <RadioButton selected={isChecked} inactive={inactive}>
        {isChecked && <Checkmark selected={isChecked} inactive={inactive} />}
      </RadioButton>
      <RadioText>{label}</RadioText>
    </Radio>
  );
};
export default RadioBox;

const Checkmark = styled.div<{
  inactive?: boolean;
  selected?: boolean;
}>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: white;
  background-color: ${({ selected, inactive, theme }) =>
    selected ? theme.select.main : inactive ? theme.content.weaker : theme.content.main};
`;

const Radio = styled.label<{
  inactive?: boolean;
  selected?: boolean;
}>`
  display: flex;
  align-items: center;
  min-width: 30px;
  min-height: 30px;
  list-style: none;
  padding: 4px;
  font-size: ${fonts.sizes.footnote}px;
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

const RadioButton = styled.span<{
  inactive?: boolean;
  selected?: boolean;
}>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid
    ${({ selected, inactive, theme }) =>
      selected ? theme.select.main : inactive ? theme.content.weaker : theme.content.main};
  margin-right: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const RadioText = styled.span`
  flex-grow: 1;
`;
