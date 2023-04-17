import { ReactNode } from "react";

import { styled } from "@reearth/theme";

const MemberList: React.FC<{ children?: ReactNode }> = ({ children }) => {
  return <Wrapper>{children}</Wrapper>;
};

const Wrapper = styled.div`
  width: 100%;
  padding: 0;
`;

export default MemberList;
