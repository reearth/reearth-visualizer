import { styled } from "@reearth/services/theme";

import CanvasArea from "./CanvasArea";

type Props = {
  sceneId?: string;
};

const Visualizer: React.FC<Props> = ({ sceneId }) => {
  return (
    <Wrapper>
      <CanvasArea sceneId={sceneId} isBuilt={false} inEditor={true} />
    </Wrapper>
  );
};

export default Visualizer;

const Wrapper = styled.div`
  background: ${({ theme }) => theme.general.bg.strong};
  height: 100%;
`;
