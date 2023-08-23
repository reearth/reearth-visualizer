import React, { useState } from "react";

import { styled } from "@reearth/services/theme";

import Property from "..";

type SpacingValues = {
  top: string;
  left: string;
  right: string;
  bottom: string;
};

type Props = {
  name?: string;
  description?: string;
  value?: SpacingValues;
  onChange?: (values: SpacingValues) => void;
};

const SpacingInput: React.FC<Props> = ({ name, description, value, onChange }) => {
  const [spacingValues, setSpacingValues] = useState<SpacingValues>(
    value || { top: "", left: "", right: "", bottom: "" },
  );

  const handleInputChange = (position: keyof SpacingValues, newValue: string) => {
    const updatedValues = { ...spacingValues, [position]: newValue };
    setSpacingValues(updatedValues);
    onChange?.(updatedValues);
  };

  function getSpacingPosition(spacingValue: SpacingValues, position: keyof SpacingValues): string {
    return spacingValue[position];
  }

  return (
    <Property name={name} description={description}>
      <StyledRectangle>
        {["top", "left", "right", "bottom"].map(position => (
          <SpacingField key={position} position={position}>
            <SpacingInputField
              value={getSpacingPosition(spacingValues, position as keyof SpacingValues)}
              onChange={e => handleInputChange(position as keyof SpacingValues, e.target.value)}
            />
            <ValueText>px</ValueText>
          </SpacingField>
        ))}
      </StyledRectangle>
    </Property>
  );
};

export default SpacingInput;

const StyledRectangle = styled.div`
  display: flex;
  position: relative;
  width: 289px;
  height: 84px;
  background: ${({ theme }) => theme.bg[1]};
  border: 1px dashed ${({ theme }) => theme.outline.weak};
  box-sizing: border-box;
`;

const SpacingField = styled.div<{ position: string }>`
  border: 1px solid ${({ theme }) => theme.outline.weak};
  border-radius: 4px;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  position: absolute;
  ${({ position }) =>
    position === "top"
      ? "top: 0; left: 50%; transform: translateX(-50%);"
      : position === "left"
      ? "left: 0; top: 50%; transform: translateY(-50%);"
      : position === "right"
      ? "right: 0; top: 50%; transform: translateY(-50%);"
      : "bottom: 0; left: 50%; transform: translateX(-50%);"};
`;

const SpacingInputField = styled.input`
  background: transparent;
  color: ${({ theme }) => theme.content.main};
  width: 14px;
  height: 20px;
  text-align: center;
  border: none;
  font-size: 12px;
`;

const ValueText = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.content.weak};
  line-height: 20px;
`;
