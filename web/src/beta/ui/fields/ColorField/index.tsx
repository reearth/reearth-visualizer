import { ColorInput, ColorInputProps } from "@reearth/beta/lib/reearth-ui";
import CommonField, {
  CommonFieldProps
} from "@reearth/beta/ui/fields/CommonField";
import { FC } from "react";


export type ColorInputFieldProps = CommonFieldProps & ColorInputProps;

const ColorInputField: FC<ColorInputFieldProps> = ({
  title,
  description,
  ...props
}) => {
  return (
    <CommonField title={title} description={description}>
      <ColorInput {...props} />
    </CommonField>
  );
};

export default ColorInputField;
