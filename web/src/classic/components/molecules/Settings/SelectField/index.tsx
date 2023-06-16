import { useMemo } from "react";

import Icon from "@reearth/classic/components/atoms/Icon";
import Select from "@reearth/classic/components/atoms/Select";
import { Option } from "@reearth/classic/components/atoms/SelectOption";
import Text from "@reearth/classic/components/atoms/Text";
import { styled } from "@reearth/services/theme";

interface SelectFieldProps<T extends string = string> {
  variant?: "filled" | "standard";
  value?: T;
  items?: { key: T; label: string; icon?: string }[];
  onChange?: (value: T) => void;
  fullWidth?: boolean;
}

// TODO: 汎用化させて molecules/property/SelectField の元にする
export function SelectField<T extends string = string>({
  value: selectedKey,
  items = [],
  onChange,
  fullWidth,
}: SelectFieldProps<T>) {
  const hasIcon = useMemo(() => items.some(({ icon }) => icon), [items]);

  return (
    <Select value={selectedKey} onChange={onChange} fullWidth={fullWidth}>
      {items.map(({ key, label, icon }) => (
        <Option key={key} value={key} label={label}>
          <OptionCheck size="xs">
            {key === selectedKey && <Icon icon="check" size={14} />}
          </OptionCheck>
          {hasIcon && <OptionIcon size="xs">{icon && <Icon icon={icon} size={14} />}</OptionIcon>}
          {label}
        </Option>
      ))}
    </Select>
  );
}

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

export default SelectField;
