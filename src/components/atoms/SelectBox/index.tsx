import React, { useMemo } from "react";
import { styled } from "@reearth/theme";

import Icon from "@reearth/components/atoms/Icon";
import Select from "@reearth/components/atoms/Select";
import Text from "@reearth/components/atoms/Text";
import fonts from "@reearth/theme/fonts";

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

const OptionCheck = styled(Text)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 20px;
  margin-right: 6px;
`;

const OptionIcon = styled(Text)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 20px;
  margin-right: 6px;
`;

const Option = styled.li<{
  focused?: boolean;
  label?: string;
}>`
  display: flex;
  list-style: none;
  padding: 6px;
  font-size: ${fonts.sizes["2xs"]}px;
  color: ${({ theme }) => theme.main.text};
  background: ${({ focused, theme }) => (focused ? "transparent" : theme.properties.bg)};
  cursor: pointer;
`;

export default SelectField;
