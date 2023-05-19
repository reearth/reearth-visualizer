import { useTheme } from "@reearth/beta/services/theme";
import SelectBox, { Item as ItemType } from "@reearth/classic/components/atoms/SelectBox";

import { FieldProps } from "../types";

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
  onChange,
}: Props<Value>) => {
  const theme = useTheme();
  const color = overridden ? theme.main.warning : linked ? theme.main.link : undefined;

  return (
    <SelectBox<Value>
      className={className}
      selected={selected}
      items={items}
      color={color}
      onChange={onChange}
    />
  );
};

export default SelectField;
