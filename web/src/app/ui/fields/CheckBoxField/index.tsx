import { CheckBox, CheckBoxProps } from "@reearth/app/lib/reearth-ui";
import CommonField, {
  CommonFieldProps
} from "@reearth/app/ui/fields/CommonField";
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
      <CheckBox {...props} dataTestid="checkboxfield-checkbox" />
    </CommonField>
  );
};

export default CheckBoxField;
