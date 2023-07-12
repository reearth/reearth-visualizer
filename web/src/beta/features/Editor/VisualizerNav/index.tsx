import styled from "@emotion/styled";
import { ReactNode } from "react";

type Props = {
  className?: string;
  children?: ReactNode;
};

const VisualizerNav: React.FC<Props> = ({ className, children }) => {
  return <Wrapper className={className}>{children}</Wrapper>;
};

export default VisualizerNav;

const Wrapper = styled.div`
  display: flex;
  gap: 24px;
  border-radius: 4px 4px 0 0;
  min-height: 48px;
`;
