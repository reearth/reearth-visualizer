import { ReactNode } from "react";

import { styled } from "@reearth/services/theme";

import CanvasArea from "./CanvasArea";

type Props = {
  sceneId?: string;
  children?: ReactNode;
};

const Visualizer: React.FC<Props> = ({ sceneId, children }) => {
  return (
    <Wrapper>
      <CanvasArea sceneId={sceneId} isBuilt={false} inEditor={true}>
        {children}
      </CanvasArea>
    </Wrapper>
  );
};

export default Visualizer;

const Wrapper = styled.div`
  background: ${({ theme }) => theme.bg[0]};
  height: 100%;
`;
