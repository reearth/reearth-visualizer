import { TextArea, TextAreaProps } from "@reearth/beta/lib/reearth-ui";
import CommonField, {
  CommonFieldProps
} from "@reearth/beta/ui/fields/CommonField";
import { FC, useEffect, useState } from "react";

export type TextAreaFieldProps = CommonFieldProps & TextAreaProps;

const TextAreaField: FC<TextAreaFieldProps> = ({
  title,
  description,
  value,
  onBlur,
  onChange,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleBlur = () => {
    if (internalValue !== value) {
      onBlur?.(internalValue as string);
    }
  };

  const handleChange = (newValue: string) => {
    setInternalValue(newValue);
    onChange?.(newValue);
  };

  return (
    <CommonField title={title} description={description}>
      <TextArea
        {...props}
        value={internalValue}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    </CommonField>
  );
};

export default TextAreaField;
