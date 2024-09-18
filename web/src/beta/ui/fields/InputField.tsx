import { TextInput, TextInputProps } from "@reearth/beta/lib/reearth-ui";
import { FC } from "react";

import CommonField, { CommonFieldProps } from "./CommonField";

export type InputFieldProps = CommonFieldProps &
  Pick<
    TextInputProps,
    "value" | "placeholder" | "onChange" | "onBlur" | "disabled" | "appearance"
  >;

const InputField: FC<InputFieldProps> = ({ title, description, ...props }) => {
  return (
    <CommonField title={title} description={description}>
      <TextInput {...props} />
    </CommonField>
  );
};

export default InputField;
