import RadioGroup from "@reearth/beta/components/RadioGroup";

import Property from "..";

export type Props = {
  onChange?: (value: string[]) => void;
  name?: string;
  description?: string;
  value?: { key: string; label: string }[];
};

const RadioGroupField: React.FC<Props> = ({ name, description, value = [], onChange }) => {
  return (
    <Property name={name} description={description}>
      <RadioGroup options={value} singleSelect layout={"horizontal"} onChange={onChange} />
    </Property>
  );
};

export default RadioGroupField;
