import { Switcher, SwitcherProps } from "@reearth/app/lib/reearth-ui";
import CommonField, {
  CommonFieldProps
} from "@reearth/app/ui/fields/CommonField";
import { FC } from "react";

export type SwitchFieldProps = CommonFieldProps & SwitcherProps;

const SwitchField: FC<SwitchFieldProps> = ({
  title,
  description,
  ...props
}) => {
  return (
    <CommonField
      title={title}
      description={description}
      data-testid="switchfield-commonfield"
    >
      <Switcher {...props} />
    </CommonField>
  );
};

export default SwitchField;
