import { Switcher, SwitcherProps } from "@reearth/beta/lib/reearth-ui";
import { FC } from "react";

import CommonField, { CommonFieldProps } from "../CommonField";

export type SwitchFieldProps = CommonFieldProps & SwitcherProps;

const SwitchField: FC<SwitchFieldProps> = ({
  title,
  description,
  ...props
}) => {
  return (
    <CommonField title={title} description={description}>
      <Switcher {...props} />
    </CommonField>
  );
};

export default SwitchField;
