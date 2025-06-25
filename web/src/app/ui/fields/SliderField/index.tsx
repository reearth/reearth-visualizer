import { Slider, SliderProps } from "@reearth/app/lib/reearth-ui";
import CommonField, {
  CommonFieldProps
} from "@reearth/app/ui/fields/CommonField";
import { FC } from "react";

export type SliderFieldProps = CommonFieldProps & SliderProps;
const SliderField: FC<SliderFieldProps> = ({
  title,
  description,
  ...props
}) => {
  return (
    <CommonField
      title={title}
      description={description}
      data-testid="sliderfield-commonfield"
    >
      <Slider {...props} />
    </CommonField>
  );
};

export default SliderField;
