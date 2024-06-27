import { FC } from "react";

import { TextInput, TextInputProps } from "@reearth/beta/lib/reearth-ui";

import CommonField, { CommonFieldProps } from "./CommonField";

export type InputFieldProps = CommonFieldProps &
  Pick<TextInputProps, "value" | "placeholder" | "onChange" | "onBlur" | "disabled">;

const InputField: FC<InputFieldProps> = ({ commonTitle, description, ...props }) => {
  return (
    <CommonField commonTitle={commonTitle} description={description}>
      <TextInput {...props} />
    </CommonField>
  );
};

export default InputField;
