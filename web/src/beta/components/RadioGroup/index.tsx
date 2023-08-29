import { useState } from "react"; // Import React and useState

import Radio from "@reearth/beta/components/Radio";
import { styled } from "@reearth/services/theme";

type Option = {
  value: string;
  label: string;
};

export type RadioGroupProps = {
  options: Option[];
  singleSelect?: boolean;
  layout?: "vertical" | "horizontal";
};

export default function RadioGroup({ options, singleSelect, layout }: RadioGroupProps) {
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const handleRadioChange = (value: string) => {
    if (singleSelect) {
      setSelectedValues([value]);
    } else {
      setSelectedValues(selected =>
        selected.includes(value) ? selected.filter(v => v !== value) : [...selected, value],
      );
    }
  };

  return (
    <RadioGroupContainer layout={layout}>
      {options.map(option => (
        <Radio
          key={option.value}
          label={option.label}
          selected={selectedValues.includes(option.value)}
          onChange={() => handleRadioChange(option.value)}
        />
      ))}
    </RadioGroupContainer>
  );
}

const RadioGroupContainer = styled.div<{ layout?: "vertical" | "horizontal" }>`
  display: flex;
  flex-direction: ${({ layout }) => (layout === "vertical" ? "column" : "row")};
`;
