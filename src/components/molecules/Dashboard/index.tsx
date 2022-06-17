import { ReactNode } from "react";

import Loading from "@reearth/components/atoms/Loading";
import { styled } from "@reearth/theme";
import { handleScroll } from "@reearth/util/handleScroll";

export * from "./types";

export type Props = {
  className?: string;
  children?: ReactNode;
  header?: ReactNode;
  isLoading?: boolean;
  hasMoreProjects?: boolean;
  onGetMoreProjects?: () => void;
};

const Dashboard: React.FC<Props> = ({
  className,
  header,
  children,
  isLoading,
  hasMoreProjects,
  onGetMoreProjects,
}) => {
  return (
    <Wrapper
      className={className}
      onScroll={e => {
        !isLoading && hasMoreProjects && handleScroll(e, onGetMoreProjects);
      }}>
      {header}
      <Content>
        {children}
        {isLoading && hasMoreProjects && <StyledLoading relative />}
      </Content>
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
const StyledLoading = styled(Loading)`
  margin: 52px auto;
`;

export default Dashboard;
