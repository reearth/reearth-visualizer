import { NumberInput, NumberInputProps } from "@reearth/beta/lib/reearth-ui";
import { FC } from "react";

import CommonField, { CommonFieldProps } from "../CommonField";

export type NumberFieldProps = CommonFieldProps & NumberInputProps;
const NumberField: FC<NumberFieldProps> = ({
  title,
  description,
  ...props
}) => {
  return (
    <CommonField title={title} description={description}>
      <NumberInput {...props} />
    </CommonField>
  );
};

export default NumberField;
