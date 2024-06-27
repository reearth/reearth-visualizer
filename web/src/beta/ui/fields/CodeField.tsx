import { FC } from "react";

import { CodeInput, CodeInputProps } from "@reearth/beta/lib/reearth-ui";

import CommonField, { CommonFieldProps } from "./CommonField";

export type CodeFieldProps = CommonFieldProps & CodeInputProps;

const CodeField: FC<CodeFieldProps> = ({ commonTitle, description, ...props }) => {
  return (
    <CommonField commonTitle={commonTitle} description={description}>
      <CodeInput {...props} />
    </CommonField>
  );
};

export default CodeField;
