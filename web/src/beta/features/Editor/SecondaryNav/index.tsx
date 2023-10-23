import styled from "@emotion/styled";
import { ReactNode } from "react";

export const SECONDARY_NAVBAR_HEIGHT = 52;

type Props = {
  className?: string;
  children?: ReactNode;
};

const VisualizerNav: React.FC<Props> = ({ className, children }) => {
  return <Wrapper className={className}>{children}</Wrapper>;
};

export default VisualizerNav;

const Wrapper = styled.div`
  border-radius: 4px 4px 0 0;
  background: ${({ theme }) => theme.bg[0]};
  height: ${SECONDARY_NAVBAR_HEIGHT}px;
`;
