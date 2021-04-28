import React from "react";

import SelectBox, { Item as ItemType } from "@reearth/components/atoms/SelectBox";
import { FieldProps, textColor } from "../types";

export type Item<Value extends string | number = string> = ItemType<Value>;

export type Props<Value extends string | number = string> = FieldProps<Value> & {
  className?: string;
  items?: Item<Value>[];
};

const SelectField = <Value extends string | number = string>({
  className,
  value: selected,
  items = [],
  linked,
  overridden,
  disabled,
  onChange,
}: Props<Value>) => {
  const color = textColor({ disabled, linked, overridden });

  return (
    <SelectBox<Value>
      className={className}
      selected={selected}
      items={items}
      disabled={disabled}
      color={color}
      onChange={onChange}
    />
  );
};

export default SelectField;
