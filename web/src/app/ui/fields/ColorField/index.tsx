import { ColorInput, ColorInputProps } from "@reearth/app/lib/reearth-ui";
import CommonField, {
  CommonFieldProps
} from "@reearth/app/ui/fields/CommonField";
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
    <CommonField
      title={title}
      description={description}
      data-testid="colorfield-commonfield"
    >
      <ColorInput
        {...props}
        onChange={handleChange}
        data-testid="colorfield-input"
      />
    </CommonField>
  );
};

export default ColorInputField;
