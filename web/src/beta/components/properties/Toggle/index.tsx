import { useCallback } from "react";

import Text from "@reearth/beta/components/Text";
import { styled, useTheme } from "@reearth/services/theme";

export type ToggleSize = "sm" | "md";

interface ToggleButtonProps {
  checked?: boolean;
  disabled?: boolean;
  parentSelected?: boolean;
  label?: string;
  size?: ToggleSize;
  onChange?: (checked: boolean) => void;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({
  checked,
  disabled,
  parentSelected,
  label,
  size = "md",
  onChange,
}) => {
  const theme = useTheme();

  const handleClick = useCallback(() => onChange?.(!checked), [checked, onChange]);

  return (
    <Wrapper>
      {label && (
        <Label size="body" color={theme.classic.main.text}>
          {label}
        </Label>
      )}
      <Switch
        size={size}
        checked={checked}
        disabled={disabled}
        selected={parentSelected}
        onClick={handleClick}>
        <TopSlider size={size} checked={checked} disabled={disabled} selected={parentSelected} />
      </Switch>
    </Wrapper>
  );
};

export default ToggleButton;

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Switch = styled.label<{
  size?: ToggleSize;
  checked?: boolean;
  disabled?: boolean;
  selected?: boolean;
}>`
  cursor: pointer;
  width: ${({ size }) => (size === "sm" ? "28px" : "40px")};
  height: ${({ size }) => (size === "sm" ? "14px" : "20px")};
  background: ${({ theme }) => theme.select.main};
  border: 1px solid ${({ theme }) => theme.select.main};
  border-radius: 11px;
  opacity: ${({ checked, selected }) => (checked || selected ? 1 : 0.5)};
  transition: 0.4s;
`;

const TopSlider = styled.div<{
  size?: ToggleSize;
  checked?: boolean;
  disabled?: boolean;
  selected?: boolean;
}>`
  width: ${({ size }) => (size === "sm" ? "14px" : "20px")};
  height: ${({ size }) => (size === "sm" ? "14px" : "20px")};
  background: ${({ selected, theme }) => (selected ? theme.text.lightest : theme.text.main)};
  transition: 0.4s;
  border-radius: 50%;
  transform: ${({ checked }) => checked && "translateX(100%)"};
`;

const Label = styled(Text)`
  margin-right: 10px;
  vertical-align: middle;
  display: inline;
`;
