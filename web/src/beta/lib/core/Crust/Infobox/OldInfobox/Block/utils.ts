import { styled } from "@reearth/services/theme";
import fonts from "@reearth/services/theme/reearthTheme/common/fonts";

import { InfoboxProperty } from "../types";

import { typographyStyles } from "./utils";

export { typographyStyles } from "../utils";

export const Title = styled.div<{ infoboxProperty?: InfoboxProperty }>`
  color: ${props => props.theme.content.main};
  font-size: ${fonts.sizes.footnote}px;
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
        ? theme.outline.main
        : isSelected
        ? theme.select.main
        : theme.content.weak};
  border-radius: 6px;
`;
