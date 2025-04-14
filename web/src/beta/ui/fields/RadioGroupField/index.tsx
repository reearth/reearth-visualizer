import { RadioGroup, RadioGroupProps } from "@reearth/beta/lib/reearth-ui";
import { FC } from "react";

import CommonField, { CommonFieldProps } from "../CommonField";

export type RadioGroupFieldProps = CommonFieldProps & RadioGroupProps;

const RadioGroupField: FC<RadioGroupFieldProps> = ({
  title,
  description,
  ...props
}) => {
  return (
    <CommonField title={title} description={description}>
      <RadioGroup {...props} />
    </CommonField>
  );
};

export default RadioGroupField;
