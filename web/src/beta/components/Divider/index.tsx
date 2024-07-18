import React from "react";

import { styled } from "@reearth/services/theme";

export type Props = {
  color?: string;
  margin?: string;
  spaceOnly?: boolean;
};

const Divider: React.FC<Props> = ({ color, margin, spaceOnly }) => {
  return <StyledDivider color={color} margin={margin} spaceOnly={spaceOnly} />;
};

const StyledDivider = styled.div<{
  color?: string;
  margin?: string;
  spaceOnly?: boolean;
}>`
  margin: ${props => (props.margin ? props.margin : "35px")} auto;
  border-bottom: ${props =>
    props.spaceOnly ? "none" : `1px solid ${props.color ? props.color : props.theme.outline.main}`};
`;

export default Divider;
