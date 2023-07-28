import styled from "@emotion/styled";
import { ReactNode } from "react";

export const navbarHeight = "52px";

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
  background: ${({ theme }) => theme.bg[1]};
  height: ${navbarHeight};
`;
