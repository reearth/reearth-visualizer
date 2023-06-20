import { ReactNode, useEffect, useRef } from "react";

import Loading from "@reearth/classic/components/atoms/Loading";
import { autoFillPage, onScrollToBottom } from "@reearth/classic/util/infinite-scroll";
import { styled } from "@reearth/services/theme";

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
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (wrapperRef.current && !isLoading && hasMoreProjects)
      autoFillPage(wrapperRef, onGetMoreProjects);
  }, [hasMoreProjects, isLoading, onGetMoreProjects]);

  return (
    <Wrapper
      className={className}
      ref={wrapperRef}
      onScroll={e => {
        !isLoading && hasMoreProjects && onScrollToBottom(e, onGetMoreProjects);
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
  background: ${({ theme }) => theme.classic.dashboard.bg};
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
