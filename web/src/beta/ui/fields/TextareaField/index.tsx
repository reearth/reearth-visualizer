import { TextArea, TextAreaProps } from "@reearth/beta/lib/reearth-ui";
import CommonField, {
  CommonFieldProps
} from "@reearth/beta/ui/fields/CommonField";
import { FC, useEffect, useState } from "react";

export type TextAreaFieldProps = {
  onChangeComplete?: (text: string) => void;
} & CommonFieldProps &
  TextAreaProps;

const TextAreaField: FC<TextAreaFieldProps> = ({
  title,
  description,
  value,
  onChangeComplete,
  onChange,
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
      data-testid="textareafield-commonfield"
    >
      <TextArea
        {...props}
        value={internalValue}
        onChange={handleChange}
        onBlur={handleChangeComplete}
        data-testid="textareafield-input"
      />
    </CommonField>
  );
};

export default TextAreaField;
