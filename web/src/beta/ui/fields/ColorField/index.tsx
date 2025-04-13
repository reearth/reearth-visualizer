import { ColorInput, ColorInputProps } from "@reearth/beta/lib/reearth-ui";
import { FC } from "react";

import CommonField, { CommonFieldProps } from "../CommonField";

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
