import { styled } from "@reearth/theme";
import fonts from "@reearth/theme/fonts";

import { InfoboxProperty } from "../types";

import { typographyStyles } from "./utils";

export { typographyStyles } from "../utils";

export const Title = styled.div<{ infoboxProperty?: InfoboxProperty }>`
  color: ${props => props.theme.infoBox.mainText};
  font-size: ${fonts.sizes.xs}px;
  ${({ infoboxProperty }) => typographyStyles(infoboxProperty?.typography)}
`;

export const Border = styled.div<{
  isSelected?: boolean;
  isHovered?: boolean;
  isEditable?: boolean;
}>`
  border: 1px solid
    ${({ isSelected, isHovered, isEditable, theme }) =>
      (!isHovered && !isSelected) || !isEditable
        ? "transparent"
        : isHovered
        ? theme.infoBox.border
        : isSelected
        ? theme.infoBox.accent2
        : theme.infoBox.weakText};
  border-radius: 6px;
`;
