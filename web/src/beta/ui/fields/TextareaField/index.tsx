import { TextArea, TextAreaProps } from "@reearth/beta/lib/reearth-ui";
import { FC } from "react";

import CommonField, { CommonFieldProps } from "../CommonField";

export type TextAreaFieldProps = CommonFieldProps & TextAreaProps;

const TextAreaField: FC<TextAreaFieldProps> = ({
  title,
  description,
  ...props
}) => {
  return (
    <CommonField title={title} description={description}>
      <TextArea {...props} />
    </CommonField>
  );
};

export default TextAreaField;
