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
  background: #3f3d45;
  display: flex;
  flex-flow: column;
  flex: auto;
  width: 100%;
  height: 100%;
`;
