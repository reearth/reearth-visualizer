import { styled } from "@reearth/services/theme";

import CanvasArea from "./CanvasArea";

const Visualizer: React.FC = () => {
  return (
    <Wrapper>
      <CanvasArea isBuilt={false} inEditor={true} />
    </Wrapper>
  );
};

export default Visualizer;

const Wrapper = styled.div`
  background: ${({ theme }) => theme.general.bg.main};
  height: 100%;
`;
