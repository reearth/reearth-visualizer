import React, { PropsWithChildren } from "react";

import { styled } from "@reearth/services/theme";

const SidePanel: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  return <Wrapper>{children}</Wrapper>;
};

export default SidePanel;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 4px;
  box-sizing: border-box;
  gap: 4px;
`;
