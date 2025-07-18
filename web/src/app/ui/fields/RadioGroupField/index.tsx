import { RadioGroup, RadioGroupProps } from "@reearth/app/lib/reearth-ui";
import CommonField, {
  CommonFieldProps
} from "@reearth/app/ui/fields/CommonField";
import { FC } from "react";

export type RadioGroupFieldProps = CommonFieldProps & RadioGroupProps;

const RadioGroupField: FC<RadioGroupFieldProps> = ({
  title,
  description,
  ...props
}) => {
  return (
    <CommonField
      title={title}
      description={description}
      data-testid="radiogroupfield-commonfield"
    >
      <RadioGroup {...props} />
    </CommonField>
  );
};

export default RadioGroupField;
