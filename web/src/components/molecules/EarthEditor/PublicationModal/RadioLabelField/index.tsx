import React from "react";

// Components
import RadioLabel, { RadioLabelProps } from "@reearth/components/atoms/RadioLabel";
import RadioLabelGroup from "@reearth/components/atoms/RadioLabelGroup";

export type RadioLabelFieldProps = {
  className?: string;
  selectedValue?: string;
  items?: RadioLabelProps[];
  onChange?: (value: string) => void;
};

const RadioLabelField: React.FC<RadioLabelFieldProps> = ({
  className,
  selectedValue,
  items = [],
  onChange,
}) => {
  return (
    <RadioLabelGroup className={className} selectedValue={selectedValue} onChange={onChange}>
      {items.map(({ value, label, disabled, inlineChildren, children }) => (
        <RadioLabel
          key={value}
          value={value}
          label={label}
          disabled={disabled}
          inlineChildren={inlineChildren}>
          {children}
        </RadioLabel>
      ))}
    </RadioLabelGroup>
  );
};

export default RadioLabelField;
