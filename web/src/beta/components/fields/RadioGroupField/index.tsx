import RadioGroup, { Option } from "@reearth/beta/components/RadioGroup";

import Property from "..";

export type Props = {
  onChange?: (value: string) => void;
  name?: string;
  description?: string;
  value?: Option[];
};

const RadioGroupField: React.FC<Props> = ({ name, description, value = [], onChange }) => {
  return (
    <Property name={name} description={description}>
      <RadioGroup options={value} layout={"horizontal"} onChange={onChange} />
    </Property>
  );
};

export default RadioGroupField;
