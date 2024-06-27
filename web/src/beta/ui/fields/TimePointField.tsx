import { FC } from "react";

import { TimePicker, TimePickerProps } from "@reearth/beta/lib/reearth-ui";

import CommonField, { CommonFieldProps } from "./CommonField";

export type TimePointFieldProps = CommonFieldProps &
  Pick<TimePickerProps, "value" | "size" | "onChange" | "onBlur" | "disabled">;

const TimePointField: FC<TimePointFieldProps> = ({ commonTitle, description, ...props }) => {
  return (
    <CommonField commonTitle={commonTitle} description={description}>
      <TimePicker {...props} />
    </CommonField>
  );
};

export default TimePointField;
