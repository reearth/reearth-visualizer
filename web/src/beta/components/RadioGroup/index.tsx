import { memo, useCallback, useState } from "react";

import RadioBox from "@reearth/beta/components/RadioBox";
import { styled } from "@reearth/services/theme";

type Option = {
  key: string;
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
  console.log(currentOptions);
  return (
    <RadioGroupContainer layout={layout}>
      {currentOptions.map(option => (
        <RadioBox
          key={`${option.key}-${key}`}
          value={option.value}
          selected={option.selected}
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
`;
