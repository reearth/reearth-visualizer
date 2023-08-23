import { useState } from "react";

import { styled } from "@reearth/services/theme";

import Property from "..";

type Props = {
  name?: string;
  description?: string;
  value?: { top: string; left: string; right: string; bottom: string };
  onChange?: (values: { top: string; left: string; right: string; bottom: string }) => void;
};

const SpacingInput: React.FC<Props> = ({ name, description, value, onChange }) => {
  const [spacingValues, setSpacingValues] = useState(
    value || { top: "", left: "", right: "", bottom: "" },
  );

  const handleInputChange = (position: string, newValue: string) => {
    const updatedValues = { ...spacingValues, [position]: newValue };
    setSpacingValues(updatedValues);
    onChange?.(updatedValues);
  };

  return (
    <Property name={name} description={description}>
      <StyledContainer>
        <StyledRectangle>
          {["top", "left", "right", "bottom"].map(position => (
            <SpacingInputField
              key={position}
              value={spacingValues[position as keyof typeof spacingValues]}
              onChange={e => handleInputChange(position, e.target.value)}
              placeholder={position}
              position={position}
            />
          ))}
        </StyledRectangle>
      </StyledContainer>
    </Property>
  );
};

export default SpacingInput;

const StyledContainer = styled.div`
  display: flex;
  align-items: center;
`;

const StyledRectangle = styled.div`
  display: flex;
  position: relative;
  width: 200px;
  height: 120px;
  border: 1px dotted ${({ theme }) => theme.outline.weak};
  box-sizing: border-box;
`;

const SpacingInputField = styled.input<{ position: string }>`
  outline: none;
  background: ${({ theme }) => theme.bg[1]};
  color: ${({ theme }) => theme.content.main};
  border: 1px solid ${({ theme }) => theme.outline.weak};
  border-radius: 4px;
  padding: 4px 8px;
  transition: all 0.3s;
  position: absolute;
  ${({ position }) => (position === "top" || position === "bottom" ? "left" : "right")}: 50%;
  transform: ${({ position }) =>
    position === "top" || position === "bottom" ? "translateX(-50%)" : "translateX(50%)"};
  text-align: center;

  :focus {
    border-color: ${({ theme }) => theme.outline.main};
  }
`;
