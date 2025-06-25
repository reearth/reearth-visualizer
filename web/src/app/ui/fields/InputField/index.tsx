import { TextInput, TextInputProps } from "@reearth/app/lib/reearth-ui";
import CommonField, {
  CommonFieldProps
} from "@reearth/app/ui/fields/CommonField";
import { FC, useState, useEffect } from "react";

export type InputFieldProps = {
  onChangeComplete?: (text: string) => void;
} & CommonFieldProps &
  Pick<
    TextInputProps,
    "value" | "placeholder" | "onChange" | "disabled" | "appearance"
  >;

const InputField: FC<InputFieldProps> = ({
  title,
  description,
  value,
  onChange,
  onChangeComplete,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleChangeComplete = () => {
    if (internalValue !== value) {
      onChangeComplete?.(internalValue as string);
    }
  };

  const handleChange = (newValue: string) => {
    setInternalValue(newValue);
    onChange?.(newValue);
  };

  return (
    <CommonField
      title={title}
      description={description}
      data-testid="inputfield-commonfield"
    >
      <TextInput
        {...props}
        value={internalValue}
        onChange={handleChange}
        onBlur={handleChangeComplete}
        dataTestid="inputfield-input"
      />
    </CommonField>
  );
};

export default InputField;
