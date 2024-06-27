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

const TextAreaField: FC<TextAreaFieldProps> = ({ commonTitle, description, ...props }) => {
  return (
    <CommonField commonTitle={commonTitle} description={description}>
      <TextArea {...props} />
    </CommonField>
  );
};

export default TextAreaField;
