import { NumberInput, NumberInputProps } from "@reearth/app/lib/reearth-ui";
import CommonField, {
  CommonFieldProps
} from "@reearth/app/ui/fields/CommonField";
import { FC, useEffect, useState } from "react";

export type NumberFieldProps = {
  onChangeComplete?: (value?: number) => void;
} & CommonFieldProps &
  Omit<NumberInputProps, "onBlur">;
const NumberField: FC<NumberFieldProps> = ({
  title,
  description,
  value,
  onChangeComplete,
  onChange,
  ...props
}) => {
  const [currentValue, setCurrentValue] = useState(value);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const handleChangeComplete = () => {
    // Normalize both to numbers for comparison
    const normalizedCurrent = typeof currentValue === 'number'
      ? currentValue
      : (typeof currentValue === 'string' && currentValue !== '' ? parseFloat(currentValue) : undefined);
    const normalizedValue = typeof value === 'number'
      ? value
      : (typeof value === 'string' && value !== '' ? parseFloat(value) : undefined);

    if (normalizedCurrent !== normalizedValue) {
      onChangeComplete?.(normalizedCurrent); // Always emits number | undefined
    }
  };

  const handleChange = (newValue?: number) => {
    setCurrentValue(newValue);
    onChange?.(newValue);
  };
  return (
    <CommonField
      title={title}
      description={description}
      data-testid="numberfield-commonfield"
    >
      <NumberInput
        {...props}
        value={currentValue}
        onBlur={handleChangeComplete}
        onChange={handleChange}
        dataTestid="numberfield-input"
      />
    </CommonField>
  );
};

export default NumberField;
