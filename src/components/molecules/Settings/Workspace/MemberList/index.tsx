import React from "react";

import { styled } from "@reearth/theme";

export type Props = {};

const MemberList: React.FC<Props> = ({ children }) => {
  return <Wrapper>{children}</Wrapper>;
};

const Wrapper = styled.div`
  width: 100%;
  padding: 0;
`;

export default MemberList;
