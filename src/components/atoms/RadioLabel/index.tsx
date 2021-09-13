import React from "react";

import RadioButton, { RadioButtonProps } from "@reearth/components/atoms/RadioButton";
import Text from "@reearth/components/atoms/Text";
import { styled, useTheme } from "@reearth/theme";

export type RadioLabelProps = RadioButtonProps & {
  label: string;
  children?: React.ReactNode;
  inlineChildren?: React.ReactNode;
  disabled?: boolean;
};

const RadioLabel: React.FC<RadioLabelProps> = ({
  label,
  value,
  inlineChildren,
  children,
  handleChange,
  disabled = false,
  checked = false,
}) => {
  const theme = useTheme();
  return (
    <>
      <Label size="m" weight="bold" color={theme.main.strongText} disabled={disabled}>
        <RadioButton
          value={value}
          disabled={disabled}
          checked={checked}
          handleChange={handleChange}
        />
        {label}
        {inlineChildren}
      </Label>
      {checked && children && <>{children}</>}
    </>
  );
};

const Label = styled(Text)<{ disabled: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  opacity: ${props => props.disabled && "0.6"};
  cursor: ${props => props.disabled && "not-allowed"};
`;

export default RadioLabel;
