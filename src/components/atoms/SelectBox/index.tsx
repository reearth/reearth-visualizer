import React, { useMemo } from "react";

import Icon from "@reearth/components/atoms/Icon";
import Select from "@reearth/components/atoms/Select";
import { Option, OptionCheck, OptionIcon } from "@reearth/components/atoms/SelectOption";

export type Item<Value extends string | number = string> = {
  key: Value;
  label: string;
  icon?: string;
};

export type Props<Value extends string | number = string> = {
  className?: string;
  selected?: Value;
  items?: Item<Value>[];
  color?: string;
  disabled?: boolean;
  onChange?: (selected: Value) => void;
};

const SelectField = <Value extends string | number = string>({
  className,
  selected,
  items = [],
  color,
  disabled,
  onChange,
}: Props<Value>) => {
  const hasIcon = useMemo(() => items.some(({ icon }) => icon), [items]);

  return (
    <Select<Value>
      className={className}
      value={selected}
      inactive={disabled}
      onChange={onChange}
      fullWidth
      color={color}>
      {items.map(({ key, label, icon }) => (
        <Option key={key} value={key} label={label}>
          <OptionCheck size="xs">{key === selected && <Icon icon="check" size={12} />}</OptionCheck>
          {hasIcon && <OptionIcon size="xs">{icon && <Icon icon={icon} />}</OptionIcon>}
          {label}
        </Option>
      ))}
    </Select>
  );
};

export default SelectField;
