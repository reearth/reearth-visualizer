import { NumberInput, NumberInputProps } from "@reearth/beta/lib/reearth-ui";
import CommonField, {
  CommonFieldProps
} from "@reearth/beta/ui/fields/CommonField";
import { FC, useEffect, useState } from "react";

export type NumberFieldProps = {
  onChangeComplete?: (value?: number) => void;
} & CommonFieldProps &
  NumberInputProps;
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
    if (currentValue !== value) {
      onChangeComplete?.(currentValue as number);
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
