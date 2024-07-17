import { FC } from "react";

import { Switcher, SwitcherProps } from "@reearth/beta/lib/reearth-ui";

import CommonField, { CommonFieldProps } from "./CommonField";

export type SwitchFieldProps = CommonFieldProps & SwitcherProps;

const SwitchField: FC<SwitchFieldProps> = ({ commonTitle, description, ...props }) => {
  return (
    <CommonField commonTitle={commonTitle} description={description}>
      <Switcher {...props} />
    </CommonField>
  );
};

export default SwitchField;
