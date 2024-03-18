import TextInput from "@reearth/beta/components/fields/common/TextInput";

import Property from "..";

export type Props = {
  className?: string;
  name?: string;
  description?: string;
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  onChange?: (text: string) => void;
  onBlur?: () => void;
};

const TextField: React.FC<Props> = ({
  className,
  name,
  description,
  value,
  placeholder,
  disabled,
  onChange,
  onBlur,
}) => {
  return (
    <Property className={className} name={name} description={description}>
      <TextInput
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
      />
    </Property>
  );
};

export default TextField;
