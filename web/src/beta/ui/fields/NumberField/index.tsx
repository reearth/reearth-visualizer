import { NumberInput, NumberInputProps } from "@reearth/beta/lib/reearth-ui";
import CommonField, {
  CommonFieldProps
} from "@reearth/beta/ui/fields/CommonField";
import { FC } from "react";


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
