import { Selector, SelectorProps } from "@reearth/beta/lib/reearth-ui";
import { FC } from "react";

import CommonField, { CommonFieldProps } from "../CommonField";

export type SelectorFieldProps = CommonFieldProps & SelectorProps;

const SelectorField: FC<SelectorFieldProps> = ({
  title,
  description,
  ...props
}) => {
  return (
    <CommonField title={title} description={description}>
      <Selector {...props} />
    </CommonField>
  );
};

export default SelectorField;
