import React from "react";

import { styled } from "@reearth/theme";

export type RadioButtonProps = {
  value: string | number;
  checked?: boolean;
  disabled?: boolean;
  handleChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const RadioButton: React.FC<RadioButtonProps> = ({
  value,
  disabled = false,
  checked = false,
  handleChange,
}) => (
  <>
    <RadioInput
      type="radio"
      checked={checked}
      value={disabled ? undefined : value}
      onChange={handleChange}
    />
    <RadioIcon />
  </>
);

const RadioInput = styled.input`
  opacity: 0;
  height: 0;
  width: 0;
  &:checked + span {
    top: 1px; /* 若干ずれるため微調整 */
    left: 1px;
    height: 7px;
    width: 7px;
    box-shadow: ${props => `0 0 0 1px ${props.theme.main.accent}`};
    background-color: ${props => props.theme.main.highlighted};
    border: 4px solid ${props => props.theme.main.bg};
  }
`;

const RadioIcon = styled.span`
  height: 15px;
  width: 15px;
  border-radius: 50%;
  background-color: ${props => props.theme.main.bg};
  border: 1px solid ${props => props.theme.main.accent};
  margin-right: 12px;
`;

export default RadioButton;
