import { TextInput, TextInputProps } from "@reearth/beta/lib/reearth-ui";
import CommonField, {
  CommonFieldProps
} from "@reearth/beta/ui/fields/CommonField";
import { FC, useState, useEffect } from "react";

export type InputFieldProps = CommonFieldProps &
  Pick<
    TextInputProps,
    "value" | "placeholder" | "onChange" | "onBlur" | "disabled" | "appearance"
  >;

const InputField: FC<InputFieldProps> = ({
  title,
  description,
  value,
  onChange,
  onBlur,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleBlur = () => {
    if (internalValue && internalValue !== value) {
      onBlur?.(internalValue);
    }
  };

  const handleChange = (newValue: string) => {
    setInternalValue(newValue);
    onChange?.(newValue);
  };

  return (
    <CommonField title={title} description={description}>
      <TextInput
        {...props}
        value={internalValue}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    </CommonField>
  );
};

export default InputField;
