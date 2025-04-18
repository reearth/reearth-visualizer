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
    <CommonField title={title} description={description}>
      <CheckBox {...props} />
    </CommonField>
  );
};

export default CheckBoxField;
