import { Slider, SliderProps } from "@reearth/beta/lib/reearth-ui";
import { FC } from "react";

import CommonField, { CommonFieldProps } from "./CommonField";

export type SliderFieldProps = CommonFieldProps & SliderProps;
const SliderField: FC<SliderFieldProps> = ({
  title,
  description,
  ...props
}) => {
  return (
    <CommonField title={title} description={description}>
      <Slider {...props} />
    </CommonField>
  );
};

export default SliderField;
