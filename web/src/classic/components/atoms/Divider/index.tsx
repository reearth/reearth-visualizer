import React from "react";

import { styled } from "@reearth/theme";

export type Props = {
  color?: string;
  margin?: string;
  spaceOnly?: boolean;
};

const Divider: React.FC<Props> = ({ color, margin, spaceOnly }) => {
  return <StyledDivider color={color} margin={margin} spaceOnly={spaceOnly} />;
};

const StyledDivider = styled.div<{ color?: string; margin?: string; spaceOnly?: boolean }>`
  width: 100%;
  margin: ${props => (props.margin ? props.margin : "35px")} auto;
  border-bottom: ${props =>
    props.spaceOnly ? "none" : `1px solid ${props.color ? props.color : props.theme.main.border}`};
`;

export default Divider;
