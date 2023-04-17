import React from "react";

// Components
import Icon from "@reearth/components/atoms/Icon";
import Radio from "@reearth/components/atoms/Radio";
import RadioGroup from "@reearth/components/atoms/RadioGroup";

import { FieldProps } from "../types";

export type Props = FieldProps<string> & {
  className?: string;
  items?: { key: string; label?: string; icon?: string }[];
};

const RadioField: React.FC<Props> = ({
  className,
  value,
  items = [],
  linked,
  overridden,
  disabled,
  onChange,
}) => {
  const inactive = !!linked || !!overridden || !!disabled;

  return (
    <RadioGroup className={className} value={value} inactive={inactive} onChange={onChange}>
      {items.map(({ key, label, icon }) => (
        <Radio key={key} value={key} linked={linked} overridden={overridden}>
          {icon ? <Icon icon={icon} size={16} alt={label || key} /> : label || key}
        </Radio>
      ))}
    </RadioGroup>
  );
};

export default RadioField;
