import { useState } from "react";

import Radio from "@reearth/beta/components/Radio";
import { styled } from "@reearth/services/theme";

type Option = {
  key: string;
  label: string;
};

export type RadioGroupProps = {
  options: Option[];
  singleSelect?: boolean;
  layout?: "vertical" | "horizontal";
  onChange?: (value: string[]) => void;
};

const RadioGroup: React.FC<RadioGroupProps> = ({ options, singleSelect, layout, onChange }) => {
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const handleRadioChange = (value: string) => {
    if (singleSelect) {
      setSelectedValues([value]);
    } else {
      setSelectedValues(selected =>
        selected.includes(value) ? selected.filter(v => v !== value) : [...selected, value],
      );
    }
    if (onChange) onChange(selectedValues);
  };

  return (
    <RadioGroupContainer layout={layout}>
      {options.map(option => (
        <Radio
          key={option.key}
          label={option.label}
          selected={selectedValues.includes(option.label)}
          onChange={() => handleRadioChange(option.label)}
        />
      ))}
    </RadioGroupContainer>
  );
};
export default RadioGroup;
const RadioGroupContainer = styled.div<{ layout?: "vertical" | "horizontal" }>`
  display: flex;
  flex-direction: ${({ layout }) => (layout === "vertical" ? "column" : "row")};
`;
