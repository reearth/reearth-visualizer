import { memo, useCallback, useState } from "react";

import RadioBox from "@reearth/beta/components/RadioGroup/RadioBox";
import { styled } from "@reearth/services/theme";

export type Option = {
  label?: string;
  keyValue: string;
};

export type RadioGroupProps = {
  options: Option[];
  layout?: "vertical" | "horizontal";
  selectedValue?: string;
  onChange?: (value: string) => void;
};

const RadioGroup: React.FC<RadioGroupProps> = ({ options, layout, selectedValue, onChange }) => {
  const [key, setKey] = useState(0);

  const handleRadioChange = useCallback(
    (value: string) => {
      if (value === selectedValue) return;

      setKey(prevKey => prevKey + 1);
      onChange?.(value);
    },
    [onChange, selectedValue],
  );

  return (
    <RadioGroupContainer layout={layout}>
      {options.map((option, index) => (
        <RadioBox
          key={`${option.keyValue}-${key}-${index}`}
          keyValue={option.keyValue}
          selected={option.keyValue === selectedValue}
          label={option.label || option.keyValue}
          onClick={() => handleRadioChange(option.keyValue)}
        />
      ))}
    </RadioGroupContainer>
  );
};

export default memo(RadioGroup);

const RadioGroupContainer = styled.div<{ layout?: "vertical" | "horizontal" }>`
  display: flex;
  flex-direction: ${({ layout }) => (layout === "vertical" ? "column" : "row")};
  gap: 12px;
`;
