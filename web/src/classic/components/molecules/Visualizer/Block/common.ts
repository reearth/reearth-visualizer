import fonts from "@reearth/classic/theme/reearthTheme/common/fonts";
import { typographyStyles } from "@reearth/classic/util/value";
import { styled } from "@reearth/services/theme";

import type { InfoboxProperty } from "../Infobox";

export const Title = styled.div<{ infoboxProperty?: InfoboxProperty }>`
  color: ${props => props.theme.classic.infoBox.mainText};
  font-size: ${fonts.sizes.xs}px;
  ${({ infoboxProperty }) => typographyStyles(infoboxProperty?.default?.typography)}
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
        ? theme.classic.infoBox.border
        : isSelected
        ? theme.classic.infoBox.accent2
        : theme.classic.infoBox.weakText};
  border-radius: 6px;
`;
