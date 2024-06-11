import { FC } from "react";

import { Switcher, SwitcherProps } from "@reearth/beta/lib/reearth-ui";

import CommonField, { CommonFieldProps } from "./CommonField";

export type InputFieldProps = CommonFieldProps &
  Pick<SwitcherProps, "value" | "onChange" | "disabled">;

const SwitchField: FC<InputFieldProps> = ({ title, description, ...props }) => {
  return (
    <CommonField title={title} description={description}>
      <Switcher {...props} />
    </CommonField>
  );
};

export default SwitchField;
