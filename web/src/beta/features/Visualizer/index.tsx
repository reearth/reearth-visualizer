import { styled, useTheme, Theme } from "@reearth/services/theme";

const Visualizer: React.FC = () => {
  const theme = useTheme();

  return <Wrapper theme={theme}>Visualizer</Wrapper>;
};

export default Visualizer;

const Wrapper = styled.div<{ theme: Theme }>`
  background: ${({ theme }) => theme.main.bg};
  flex: 1;
`;
