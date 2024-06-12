import { FC } from "react";

import { CodeInput, CodeInputProps } from "@reearth/beta/lib/reearth-ui";

import CommonField, { CommonFieldProps } from "./CommonField";

export type CodeFieldProps = CommonFieldProps &
  Pick<CodeInputProps, "value" | "language" | "showLines" | "onChange" | "onBlur" | "disabled">;

const CodeField: FC<CodeFieldProps> = ({ title, description, ...props }) => {
  return (
    <CommonField title={title} description={description}>
      <CodeInput {...props} />
    </CommonField>
  );
};

export default CodeField;
