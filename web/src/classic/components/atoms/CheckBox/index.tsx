import React from "react";

// Theme
import { styled } from "@reearth/services/theme";

interface CheckBoxProps {
  checked?: boolean;
  onChange?: (value: boolean) => void;
  disabled?: boolean;
}

const CheckBox: React.FC<CheckBoxProps> = ({ checked, onChange, disabled }) => {
  return (
    <Wrapper>
      <StyledInput
        type="checkbox"
        checked={checked}
        onChange={e => onChange?.(e.currentTarget.checked)}
        disabled={disabled}
      />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 5px 0;
`;

const StyledInput = styled.input`
  border: none;
  outline: none;
  margin: 5px;
`;

export default CheckBox;
