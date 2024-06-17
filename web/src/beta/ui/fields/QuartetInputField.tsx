import { FC } from "react";

import { TextInput, TextInputProps } from "@reearth/beta/lib/reearth-ui";

import CommonField, { CommonFieldProps } from "./CommonField";

export type QuartetInputFieldProps = CommonFieldProps &
  Pick<TextInputProps, "value" | "placeholder" | "onChange" | "onBlur" | "disabled">;

const QuartetInputField: FC<QuartetInputFieldProps> = ({ title, description, ...props }) => {
  return (
    <CommonField title={title} description={description}>
      <TextInput {...props} />
      <TextInput {...props} />
      <TextInput {...props} />
    </CommonField>
  );
};

export default QuartetInputField;
