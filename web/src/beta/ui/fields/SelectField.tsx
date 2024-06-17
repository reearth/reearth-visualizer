import { FC } from "react";

import { Selector, SelectorProps } from "@reearth/beta/lib/reearth-ui";

import CommonField, { CommonFieldProps } from "./CommonField";

export type SelectorFieldProps = CommonFieldProps &
  Pick<SelectorProps, "value" | "placeholder" | "onChange" | "multiple" | "disabled" | "options">;

const SelectorField: FC<SelectorFieldProps> = ({ title, description, ...props }) => {
  return (
    <CommonField title={title} description={description}>
      <Selector {...props} />
    </CommonField>
  );
};

export default SelectorField;
