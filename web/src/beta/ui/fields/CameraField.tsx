import { FC } from "react";

import { TextInput, TextInputProps, Popup, PopupProps } from "@reearth/beta/lib/reearth-ui";

import CommonField, { CommonFieldProps } from "./CommonField";

export type CameraFieldProps = CommonFieldProps &
  Pick<TextInputProps, "value" | "placeholder" | "onChange" | "onBlur" | "disabled"> & {
    firstPopupProps?: PopupProps;
    secondPopupProps?: PopupProps;
  };

const CameraField: FC<CameraFieldProps> = ({
  title,
  description,
  firstPopupProps,
  secondPopupProps,
  ...props
}) => {
  return (
    <CommonField title={title} description={description}>
      <TextInput {...props} />
      <Popup {...firstPopupProps} placement={"bottom-start"} />
      <Popup {...secondPopupProps} placement={"bottom-start"} />
    </CommonField>
  );
};

export default CameraField;
