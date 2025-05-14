import { RadioGroup, RadioGroupProps } from "@reearth/beta/lib/reearth-ui";
import CommonField, {
  CommonFieldProps
} from "@reearth/beta/ui/fields/CommonField";
import { FC } from "react";


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
