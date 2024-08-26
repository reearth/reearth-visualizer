import { TextArea, TextAreaProps } from "@reearth/beta/lib/reearth-ui";
import { FC } from "react";


import CommonField, { CommonFieldProps } from "./CommonField";

export type TextAreaFieldProps = CommonFieldProps & TextAreaProps;

const TextAreaField: FC<TextAreaFieldProps> = ({
  commonTitle,
  description,
  ...props
}) => {
  return (
    <CommonField commonTitle={commonTitle} description={description}>
      <TextArea {...props} />
    </CommonField>
  );
};

export default TextAreaField;
