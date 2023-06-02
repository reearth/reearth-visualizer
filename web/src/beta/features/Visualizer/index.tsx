import { styled, useTheme, Theme } from "@reearth/services/theme";

import CanvasArea from "./CanvasArea";

const Visualizer: React.FC = () => {
  const theme = useTheme();

  return (
    <Wrapper theme={theme}>
      <CanvasArea isBuilt={false} inEditor={true} />
    </Wrapper>
  );
};

export default Visualizer;

const Wrapper = styled.div<{ theme: Theme }>`
  background: ${({ theme }) => theme.main.bg};
  display: flex;
  flex-flow: column;
  flex: auto;
  width: 100%;
  height: 100%;
`;
