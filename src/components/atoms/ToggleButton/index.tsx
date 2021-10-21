import React from "react";

import Text from "@reearth/components/atoms/Text";
import { styled, useTheme } from "@reearth/theme";

export type ToggleSize = "sm" | "md";

interface ToggleButtonProps {
  checked?: boolean;
  disabled?: boolean;
  parentSelected?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  size?: ToggleSize;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({
  checked,
  disabled,
  parentSelected,
  onChange,
  label,
  size = "md",
}) => {
  const handleClick = !disabled && onChange ? () => onChange(!checked) : undefined;
  const theme = useTheme();
  return (
    <>
      <Switch
        size={size}
        checked={checked}
        disabled={disabled}
        selected={parentSelected}
        onClick={handleClick}>
        <TopSlider size={size} checked={checked} disabled={disabled} selected={parentSelected} />
      </Switch>
      {label && (
        <Label size="2xs" color={theme.main.text}>
          {label}
        </Label>
      )}
    </>
  );
};

export default ToggleButton;

const Switch = styled.label<{
  size?: ToggleSize;
  checked?: boolean;
  disabled?: boolean;
  selected?: boolean;
}>`
  display: inline-block;
  cursor: pointer;
  width: ${({ size }) => (size === "sm" ? "24px" : "36px")};
  height: ${({ size }) => (size === "sm" ? "12px" : "18px")};
  border-radius: 11px;
  border: 1px solid
    ${({ checked, selected, theme }) =>
      selected
        ? theme.toggleButton.highlight
        : checked
        ? theme.toggleButton.activeBgBorder
        : theme.toggleButton.bgBorder};
  opacity: ${({ checked, selected }) => (checked || selected ? 1 : 0.35)};
  transition: 0.4s;
  vertical-align: middle;
`;

const TopSlider = styled.div<{
  size?: ToggleSize;
  checked?: boolean;
  disabled?: boolean;
  selected?: boolean;
}>`
  width: ${({ size }) => (size === "sm" ? "12px" : "18px")};
  height: ${({ size }) => (size === "sm" ? "12px" : "18px")};
  background-color: ${({ checked, selected, theme }) =>
    selected
      ? theme.toggleButton.highlight
      : checked
      ? theme.toggleButton.activeToggle
      : theme.toggleButton.toggle};
  transition: 0.4s;
  border-radius: 50%;
  transform: ${({ checked }) => checked && "translateX(100%)"};
  vertical-align: middle;
`;

const Label = styled(Text)`
  margin-left: 10px;
  vertical-align: middle;
  display: inline;
`;
