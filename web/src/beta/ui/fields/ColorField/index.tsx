import { ColorInput, ColorInputProps } from "@reearth/beta/lib/reearth-ui";
import CommonField, {
  CommonFieldProps
} from "@reearth/beta/ui/fields/CommonField";
import { FC } from "react";

export type ColorInputFieldProps = CommonFieldProps & ColorInputProps;

const ColorInputField: FC<ColorInputFieldProps> = ({
  title,
  description,
  value,
  onChange,
  ...props
}) => {

  const handleChange = (newValue: string) => {
    if (newValue !== value) {
      onChange?.(newValue);
    }
  };
  
  return (
    <CommonField title={title} description={description}>
      <ColorInput {...props} onChange={handleChange} />
    </CommonField>
  );
};

export default ColorInputField;
