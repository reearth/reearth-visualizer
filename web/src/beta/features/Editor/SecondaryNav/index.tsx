import styled from "@emotion/styled";
import { ReactNode } from "react";

export const SECONDARY_NAVBAR_HEIGHT = 51.5;

type Props = {
  className?: string;
  children?: ReactNode;
};

const VisualizerNav: React.FC<Props> = ({ className, children }) => {
  return <Wrapper className={className}>{children}</Wrapper>;
};

export default VisualizerNav;

const Wrapper = styled.div`
  background: ${({ theme }) => theme.bg[0]};
  height: ${SECONDARY_NAVBAR_HEIGHT}px;
  border-top: 0.5px solid ${({ theme }) => theme.outline.weaker};
`;
