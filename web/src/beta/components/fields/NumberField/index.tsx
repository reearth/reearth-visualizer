import Property from "..";
import NumberInput from "../common/NumberInput";

export type Props = {
  name?: string;
  description?: string;
  suffix?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
  inputDescription?: string;
  value?: number;
  onChange?: (value?: number | undefined) => void;
};

const NumberField: React.FC<Props> = ({
  name,
  description,
  value,
  min,
  max,
  suffix,
  inputDescription,
  disabled,
  onChange,
}) => {
  return (
    <Property name={name} description={description}>
      <NumberInput
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        suffix={suffix}
        disabled={disabled}
        inputDescription={inputDescription}
      />
    </Property>
  );
};

export default NumberField;
