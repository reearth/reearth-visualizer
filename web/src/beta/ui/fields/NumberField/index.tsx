import { NumberInput, NumberInputProps } from "@reearth/beta/lib/reearth-ui";
import CommonField, {
  CommonFieldProps
} from "@reearth/beta/ui/fields/CommonField";
import { FC, useEffect, useState } from "react";

export type NumberFieldProps = CommonFieldProps & NumberInputProps;
const NumberField: FC<NumberFieldProps> = ({
  title,
  description,
  value,
  onBlur,
  onChange,
  ...props
}) => {
  const [currentValue, setCurrentValue] = useState(value);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const handleBlur = () => {
    if (currentValue !== value) {
      onBlur?.(currentValue as number);
    }
  };

  const handleChange = (newValue?: number) => {
    setCurrentValue(newValue);
    onChange?.(newValue);
  };
  return (
    <CommonField title={title} description={description}>
      <NumberInput
        {...props}
        value={currentValue}
        onBlur={handleBlur}
        onChange={handleChange}
      />
    </CommonField>
  );
};

export default NumberField;
