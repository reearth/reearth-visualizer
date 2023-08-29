import React from "react";

// Components
import Icon from "@reearth/beta/components/Icon";
import Radio from "@reearth/beta/components/Radio";
import RadioGroup from "@reearth/classic/components/atoms/RadioGroup";

export type Props = {
  className?: string;
  value?: string;
  onChange?: (value: string | undefined) => void;
  name?: string;
  description?: string;
  disabled?: boolean;
  items?: { key: string; label?: string; icon?: string }[];
};

const RadioField: React.FC<Props> = ({ className, value, items = [], disabled, onChange }) => {
  const inactive = !!disabled;

  return (
    <RadioGroup className={className} value={value} inactive={inactive} onChange={onChange}>
      {items.map(({ key, label, icon }) => (
        <Radio key={key} value={key}>
          {icon ? <Icon icon={icon} size={16} alt={label || key} /> : label || key}
        </Radio>
      ))}
    </RadioGroup>
  );
};

export default RadioField;
