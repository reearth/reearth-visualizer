import React, { useState } from "react";

import { styled } from "@reearth/services/theme";

import Property from "..";
import NumberInput from "../common/NumberInput";

export type SpacingValues = {
  top: number;
  left: number;
  right: number;
  bottom: number;
};

type Props = {
  name?: string;
  description?: string;
  value?: SpacingValues;
  min?: number;
  max?: number;
  onChange?: (values: SpacingValues) => void;
};

const SpacingInput: React.FC<Props> = ({ name, description, value, min, max, onChange }) => {
  const [spacingValues, setSpacingValues] = useState<SpacingValues>(
    value || { top: 0, left: 0, right: 0, bottom: 0 },
  );

  const handleInputChange = (
    position: keyof SpacingValues,
    newValue: string | number | undefined,
  ) => {
    const updatedValues = { ...spacingValues, [position]: newValue };
    setSpacingValues(updatedValues);
    onChange?.(updatedValues);
  };

  return (
    <Property name={name} description={description}>
      <StyledRectangle>
        {["top", "left", "right", "bottom"].map(position => (
          <SpacingField
            value={getSpacingPosition(spacingValues, position as keyof SpacingValues)}
            suffix="px"
            key={position}
            position={position}
            min={min}
            max={max}
            onChange={newValue => handleInputChange(position as keyof SpacingValues, newValue)}
          />
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
  border: 1px dashed ${({ theme }) => theme.outline.weak};
  box-sizing: border-box;
`;

const SpacingField = styled(NumberInput)<{ position: string }>`
  width: 40px;
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

function getSpacingPosition(spacingValue: SpacingValues, position: keyof SpacingValues): number {
  return spacingValue[position];
}
