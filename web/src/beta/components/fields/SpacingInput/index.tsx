import { useMemo, useState } from "react";

import { styled } from "@reearth/services/theme";

import Property from "..";
import NumberInput from "../common/NumberInput";

export type SpacingValues = {
  top: number;
  left: number;
  right: number;
  bottom: number;
};

const SPACING_POSITIONS = ["top", "left", "right", "bottom"];

type Props = {
  name?: string;
  description?: string;
  value?: SpacingValues;
  min?: number;
  max?: number;
  onChange?: (values: SpacingValues) => void;
};

type Position = keyof SpacingValues;

const SpacingInput: React.FC<Props> = ({ name, description, value, min, max, onChange }) => {
  const [spacingValues, setSpacingValues] = useState<SpacingValues>(
    value || { top: 0, left: 0, right: 0, bottom: 0 },
  );

  const memoizedSpacingValues = useMemo(
    () =>
      SPACING_POSITIONS.map(position => getSpacingPosition(spacingValues, position as Position)),
    [spacingValues],
  );

  const handleInputChange = (position: Position, newValue?: number) => {
    const updatedValues = { ...spacingValues, [position]: newValue };
    setSpacingValues(updatedValues);
    onChange?.(updatedValues);
  };

  return (
    <Property name={name} description={description}>
      <StyledRectangle>
        {SPACING_POSITIONS.map((position, index) => (
          <SpacingField
            key={position}
            value={memoizedSpacingValues[index]}
            suffix="px"
            position={position}
            min={min}
            max={max}
            expandWithContent
            onChange={newValue => handleInputChange(position as Position, newValue)}
          />
        ))}
      </StyledRectangle>
    </Property>
  );
};

export default SpacingInput;

const StyledRectangle = styled.div`
  display: flex;
  width: 100%;
  height: 94px;
  border: 1px dashed ${({ theme }) => theme.outline.weak};
  box-sizing: border-box;
  position: relative;
`;

const SpacingField = styled(NumberInput)<{ position: string }>`
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

function getSpacingPosition(spacingValue: SpacingValues, position: Position): number {
  return spacingValue[position];
}
