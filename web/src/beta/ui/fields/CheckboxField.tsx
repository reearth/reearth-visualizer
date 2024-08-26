import { CheckBox, CheckBoxProps } from "@reearth/beta/lib/reearth-ui";
import { FC } from "react";


import CommonField, { CommonFieldProps } from "./CommonField";

export type CheckBoxFieldProps = CommonFieldProps & CheckBoxProps;

const CheckBoxField: FC<CheckBoxFieldProps> = ({
  commonTitle,
  description,
  ...props
}) => {
  return (
    <CommonField commonTitle={commonTitle} description={description}>
      <CheckBox {...props} />
    </CommonField>
  );
};

export default CheckBoxField;
