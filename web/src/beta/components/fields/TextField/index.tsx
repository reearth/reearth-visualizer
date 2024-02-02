import TextInput from "@reearth/beta/components/fields/common/TextInput";

import Property from "..";

export type Props = {
  className?: string;
  name?: string;
  description?: string;
  value?: string;
  placeholder?: string;
  onChange?: (text: string) => void;
  disabled?: boolean;
};

const TextField: React.FC<Props> = ({
  className,
  name,
  description,
  value,
  placeholder,
  disabled,
  onChange,
}) => {
  return (
    <Property className={className} name={name} description={description}>
      <TextInput value={value} placeholder={placeholder} onChange={onChange} disabled={disabled} />
    </Property>
  );
};

export default TextField;
