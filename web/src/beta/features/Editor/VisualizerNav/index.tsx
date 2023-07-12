import styled from "@emotion/styled";
import { ReactNode } from "react";

type Props = {
  children?: ReactNode;
};

const VisualizerNav: React.FC<Props> = ({ children }) => {
  return <Wrapper>{children}</Wrapper>;
};

export default VisualizerNav;

const Wrapper = styled.div`
  display: flex;
  gap: 24px;
  background: ${({ theme }) => theme.general.bg.main};
  border-radius: 4px 4px 0 0;
  padding: 8px;
  height: 48px;
`;
