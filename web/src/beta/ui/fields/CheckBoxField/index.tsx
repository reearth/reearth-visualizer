import { CheckBox, CheckBoxProps } from "@reearth/beta/lib/reearth-ui";
import CommonField, {
  CommonFieldProps
} from "@reearth/beta/ui/fields/CommonField";
import { FC } from "react";

export type CheckBoxFieldProps = CommonFieldProps & CheckBoxProps;

const CheckBoxField: FC<CheckBoxFieldProps> = ({
  title,
  description,
  ...props
}) => {
  return (
    <CommonField
      title={title}
      description={description}
      data-testid="checkboxfield-commonfield"
    >
      <CheckBox {...props} data-testid="checkboxfield-checkbox" />
    </CommonField>
  );
};

export default CheckBoxField;
