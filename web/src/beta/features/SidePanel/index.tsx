import React, { PropsWithChildren } from "react";

import { styled } from "@reearth/services/theme";

type Props = {
  location: "left" | "right";
};

const SidePanel: React.FC<PropsWithChildren<Props>> = ({ children, location }) => {
  return <Wrapper location={location}>{children}</Wrapper>;
};

export default SidePanel;

const Wrapper = styled.div<Pick<Props, "location">>`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  gap: 4px;
  padding: 4px;

  // for Resizable gutter width
  ${({ location }) => location === "left" && `padding-right: 0;`}
  ${({ location }) => location === "right" && `padding-left: 0;`}
`;
