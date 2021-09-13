import React from "react";

import Text from "@reearth/components/atoms/Text";
import { styled, useTheme } from "@reearth/theme";

interface ToggleButtonProps {
  checked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ checked, disabled, onChange, label }) => {
  const handleClick = !disabled && onChange ? () => onChange(!checked) : undefined;
  const theme = useTheme();
  return (
    <>
      <Switch checked={checked} disabled={disabled} onClick={handleClick}>
        <TopSlider checked={checked} disabled={disabled} onClick={handleClick} />
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

const Switch = styled.label<{ checked?: boolean; disabled?: boolean }>`
  display: inline-block;
  width: 36px;
  height: 18px;
  border-radius: 11px;
  border: 1px solid
    ${props =>
      props.checked ? props.theme.toggleButton.activeBgBorder : props.theme.toggleButton.bgBorder};
  background-color: ${props =>
    props.checked ? props.theme.toggleButton.activeBg : props.theme.toggleButton.bg};
  opacity: ${props => (props.checked ? 1 : 0.35)};
  transition: 0.4s;
  vertical-align: middle;
`;

const TopSlider = styled.div<{ checked?: boolean; disabled?: boolean }>`
  cursor: pointer;
  height: 18px;
  width: 18px;
  background-color: ${props =>
    props.checked ? props.theme.toggleButton.activeToggle : props.theme.toggleButton.toggle};
  transition: 0.4s;
  border-radius: 50%;
  transform: ${props => props.checked && "translateX(100%)"};
  vertical-align: middle;
`;

const Label = styled(Text)`
  margin-left: 10px;
  vertical-align: middle;
  display: inline;
`;
