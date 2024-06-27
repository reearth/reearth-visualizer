import { FC } from "react";

import { ColorInput, ColorInputProps } from "@reearth/beta/lib/reearth-ui";

import CommonField, { CommonFieldProps } from "./CommonField";

export type ColorInputFieldProps = CommonFieldProps &
  Pick<ColorInputProps, "value" | "size" | "onChange" | "alphaDisabled" | "disabled">;

const ColorInputField: FC<ColorInputFieldProps> = ({ commonTitle, description, ...props }) => {
  return (
    <CommonField commonTitle={commonTitle} description={description}>
      <ColorInput {...props} />
    </CommonField>
  );
};

export default ColorInputField;
