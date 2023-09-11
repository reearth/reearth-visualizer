import TextInput from "@reearth/beta/components/fields/common/TextInput";

import Property from "..";

export type Props = {
  name?: string;
  description?: string;
  value?: string;
  placeholder?: string;
  timeout?: number;
  onChange?: (text: string) => void;
};

const TextField: React.FC<Props> = ({
  name,
  description,
  value,
  placeholder,
  timeout,
  onChange,
}) => {
  return (
    <Property name={name} description={description}>
      <TextInput value={value} placeholder={placeholder} onChange={onChange} timeout={timeout} />
    </Property>
  );
};

export default TextField;
