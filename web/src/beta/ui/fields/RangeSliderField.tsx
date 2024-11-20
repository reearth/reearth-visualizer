import { RangeSlider, RangeSliderProps } from "@reearth/beta/lib/reearth-ui";
import { FC } from "react";

import CommonField, { CommonFieldProps } from "./CommonField";

export type RangeSliderFieldProps = CommonFieldProps & RangeSliderProps;
const RangeSliderField: FC<RangeSliderFieldProps> = ({
  title,
  description,
  ...props
}) => {
  return (
    <CommonField title={title} description={description}>
      <RangeSlider {...props} />
    </CommonField>
  );
};

export default RangeSliderField;
