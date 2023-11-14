import TextInput from "@reearth/beta/components/fields/common/TextInput";

import Property from "..";

export type Props = {
  name?: string;
  description?: string;
  value?: string;
  placeholder?: string;
  timeout?: number;
  onChange?: (text: string) => void;
  disabled?: boolean;
};

const TextField: React.FC<Props> = ({
  name,
  description,
  value,
  placeholder,
  timeout,
  onChange,
  disabled,
}) => {
  return (
    <Property name={name} description={description}>
      <TextInput
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        timeout={timeout}
        disabled={disabled}
      />
    </Property>
  );
};

export default TextField;
