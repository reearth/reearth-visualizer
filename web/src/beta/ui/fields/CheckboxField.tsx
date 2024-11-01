import { CheckBox, CheckBoxProps } from "@reearth/beta/lib/reearth-ui";
import { FC } from "react";

import CommonField, { CommonFieldProps } from "./CommonField";

export type CheckBoxFieldProps = CommonFieldProps & CheckBoxProps;

const CheckBoxField: FC<CheckBoxFieldProps> = ({
  title,
  description,
  ...props
}) => {
  return (
    <CommonField title={title} description={description}>
      <CheckBox {...props} />
    </CommonField>
  );
};

export default CheckBoxField;
