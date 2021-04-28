import { styled } from "@reearth/theme";
import { typographyStyles } from "@reearth/util/value";
import { InfoboxProperty } from "../../PluginBlock";
import fonts from "@reearth/theme/fonts";

export const Title = styled.div<{ infoboxStyles?: InfoboxProperty }>`
  color: ${props => props.theme.infoBox.mainText};
  font-size: ${fonts.sizes.xs}px;
  ${({ infoboxStyles }) => typographyStyles(infoboxStyles?.default?.typography)}
`;
