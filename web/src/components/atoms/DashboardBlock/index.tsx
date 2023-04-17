import { ReactNode } from "react";

import { styled } from "@reearth/theme";

export interface Props {
  className?: string;
  children?: ReactNode;
  grow?: number;
}

const DashboardBlock: React.FC<Props> = ({ className, children, grow }) => {
  return (
    <StyledWrapper className={className} grow={grow}>
      <Block>{children}</Block>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div<{ grow?: number }>`
  flex-grow: ${({ grow }) => (grow || grow === 0 ? grow : 1)};
`;

const Block = styled.div`
  border-radius: 12px;
  margin: 14px;
  background-color: ${({ theme }) => theme.dashboard.itemBg};
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
`;

export default DashboardBlock;
