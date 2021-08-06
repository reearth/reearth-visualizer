import React from "react";
import { styled } from "@reearth/theme";

export interface Props {
  className?: string;
  header?: React.ReactNode;
}

const Dashboard: React.FC<Props> = ({ className, header, children }) => {
  return (
    <Wrapper className={className}>
      {header}
      <Content>{children}</Content>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  background: ${({ theme }) => theme.dashboard.bg};
  height: 100%;
  overflow: auto;
`;

const Content = styled.div`
  margin: 10px;
  display: flex;
  flex-wrap: wrap;
`;

export default Dashboard;
