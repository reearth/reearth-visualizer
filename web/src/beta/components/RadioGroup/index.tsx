import { memo, useCallback, useState } from "react";

import RadioBox from "@reearth/beta/components/RadioGroup/RadioBox";
import { styled } from "@reearth/services/theme";

export type Option = {
  label?: string;
  value: string;
  selected: boolean;
};

export type RadioGroupProps = {
  options: Option[];
  layout?: "vertical" | "horizontal";
  onChange?: (value: string) => void;
};

const RadioGroup: React.FC<RadioGroupProps> = ({ options, layout, onChange }) => {
  const [currentOptions, updateOptions] = useState<Option[]>(options);
  const [key, setKey] = useState(0);

  const handleRadioChange = useCallback(
    (value: string) => {
      updateOptions(
        currentOptions.map(option => ({
          ...option,
          selected: !option.selected && option.value === value,
        })),
      );
      setKey(prevKey => prevKey + 1);
      onChange?.(value);
    },
    [currentOptions, onChange],
  );
  return (
    <RadioGroupContainer layout={layout}>
      {currentOptions.map((option, index) => (
        <RadioBox
          key={`${option.label}-${key}-${index}`}
          value={option.value}
          selected={option.selected}
          label={option.label}
          onClick={() => handleRadioChange(option.value)}
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
