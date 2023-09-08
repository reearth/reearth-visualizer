import Property from "@reearth/beta/components/fields";
import Slider, { Props as SliderProps } from "@reearth/beta/components/Slider";

export type Props = {
  name?: string;
  description?: string;
} & SliderProps;

const SliderField: React.FC<Props> = ({ name, description, ...args }: Props) => {
  return (
    <Property name={name} description={description}>
      <Slider {...args} />
    </Property>
  );
};

export default SliderField;
