import { FC } from "react";

import { TextInput, TextInputProps, Button, ButtonProps } from "@reearth/beta/lib/reearth-ui";

import CommonField, { CommonFieldProps } from "./CommonField";

export type CameraFieldProps = CommonFieldProps &
  Pick<TextInputProps, "value" | "placeholder" | "onChange" | "onBlur" | "disabled"> & {
    buttonFirstProps?: ButtonProps;
    buttonSecondProps?: ButtonProps;
  };

const CameraField: FC<CameraFieldProps> = ({
  title,
  description,
  buttonFirstProps,
  buttonSecondProps,
  ...props
}) => {
  return (
    <CommonField title={title} description={description}>
      <TextInput {...props} />
      <Button {...buttonFirstProps} />
      <Button {...buttonSecondProps} />
    </CommonField>
  );
};

export default CameraField;
