import React, { useMemo } from "react";

import { styled } from "@reearth/theme";
import Select, { Props as SelectProps } from "@reearth/components/atoms/Select";
import Icon from "@reearth/components/atoms/Icon";
import Option from "@reearth/components/atoms/SelectOption";
import Text from "@reearth/components/atoms/Text";

interface SelectFieldProps {
  variant?: "filled" | "standard";
  value?: string;
  items?: { key: string; label: string; icon?: string }[];
  onChange?: (value: string) => void;
  fullWidth?: boolean;
}

// TODO: 汎用化させて molecules/property/SelectField の元にする
const SelectField: React.FC<SelectFieldProps> = ({
  value: selectedKey,
  items = [],
  onChange,
  fullWidth,
}) => {
  const hasIcon = useMemo(() => items.some(({ icon }) => icon), [items]);

  return (
    <StyledSelect value={selectedKey} onChange={onChange} fullWidth={fullWidth}>
      {items.map(({ key, label, icon }) => (
        <Option key={key} value={key} label={label}>
          <OptionCheck size="xs">
            {key === selectedKey && <Icon icon="check" size={14} />}
          </OptionCheck>
          {hasIcon && <OptionIcon size="xs">{icon && <img src={icon} />}</OptionIcon>}
          {label}
        </Option>
      ))}
    </StyledSelect>
  );
};

const StyledSelect = styled(Select as React.ComponentType<SelectProps<string>>)`
  height: 40px;
`;

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
