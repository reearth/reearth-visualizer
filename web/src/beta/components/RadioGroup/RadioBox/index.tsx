import { useCallback } from "react";

import { fonts, styled } from "@reearth/services/theme";

export type Props = {
  selected?: boolean;
  keyValue: string;
  label?: string;
  onClick?: (value: string) => void;
};

const RadioBox: React.FC<Props> = ({ selected, keyValue, label, onClick }: Props) => {
  const handleRadioClick = useCallback(
    (value: string) => {
      onClick?.(value);
    },
    [onClick],
  );

  return (
    <Radio>
      <RadioInput type="radio" value={keyValue} onClick={() => handleRadioClick(keyValue)} />
      <RadioButton selected={selected}>
        {selected && <RadioIndicator selected={selected} />}
      </RadioButton>
      <RadioText>{label}</RadioText>
    </Radio>
  );
};
export default RadioBox;

const RadioIndicator = styled.div<{
  selected?: boolean;
}>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: white;
  background-color: ${({ selected, theme }) => (selected ? theme.select.main : theme.content.main)};
`;

const Radio = styled.label`
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
  selected?: boolean;
}>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid ${({ selected, theme }) => (selected ? theme.select.main : theme.content.main)};
  margin-right: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const RadioText = styled.span`
  flex-grow: 1;
`;
