import { Slider, SliderProps } from "@reearth/app/lib/reearth-ui";
import CommonField, {
  CommonFieldProps
} from "@reearth/app/ui/fields/CommonField";
import { FC } from "react";

export type SliderFieldProps = CommonFieldProps & SliderProps;
const SliderField: FC<SliderFieldProps> = ({
  title,
  description,
  titleAdornment,
  beforeInput,
  afterInput,
  ...props
}) => {
  return (
    <CommonField
      title={title}
      description={description}
      titleAdornment={titleAdornment}
      beforeInput={beforeInput}
      afterInput={afterInput}
      data-testid="sliderfield-commonfield"
    >
      <Slider {...props} />
    </CommonField>
  );
};

export default SliderField;
