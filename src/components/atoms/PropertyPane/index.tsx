import React from "react";

import { styled } from "@reearth/theme";

export interface Props {
  className?: string;
}

const PropertyPane: React.FC<Props> = ({ className, children }) => {
  return <Wrapper className={className}>{children}</Wrapper>;
};

const Wrapper = styled.div`
  background: ${props => props.theme.properties};
  margin: 14px 0;
`;

export default PropertyPane;
