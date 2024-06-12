import { FC } from "react";

import { TextArea, TextAreaProps } from "@reearth/beta/lib/reearth-ui";

import CommonField, { CommonFieldProps } from "./CommonField";

export type TextAreaFieldProps = CommonFieldProps &
  Pick<
    TextAreaProps,
    | "value"
    | "placeholder"
    | "resizable"
    | "rows"
    | "counter"
    | "maxLength"
    | "onChange"
    | "onBlur"
    | "disabled"
  >;

const TextAreaField: FC<TextAreaFieldProps> = ({ title, description, ...props }) => {
  return (
    <CommonField title={title} description={description}>
      <TextArea {...props} />
    </CommonField>
  );
};

export default TextAreaField;
